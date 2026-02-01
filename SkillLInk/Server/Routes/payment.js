import express from 'express';
import pool from '../Services/db.js';
import { protect } from '../middleWear/auth.js';

const Router = express.Router();

// Khalti API configuration
// Sandbox: https://a.khalti.com/api/v2 (for testing)
// Production: https://khalti.com/api/v2 (for live payments)
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://khalti.com/api/v2' 
    : 'https://a.khalti.com/api/v2';

console.log('Khalti API URL:', KHALTI_API_URL);
console.log('Khalti Key configured:', KHALTI_SECRET_KEY ? 'Yes' : 'No');

// Helper function to make Khalti API calls
const khaltiRequest = async (endpoint, data) => {
    console.log('Khalti Request:', endpoint, JSON.stringify(data, null, 2));
    
    const response = await fetch(`${KHALTI_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Authorization': `Key ${KHALTI_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    
    const result = await response.json();
    console.log('Khalti Response:', JSON.stringify(result, null, 2));
    
    return result;
};

// Initiate Khalti payment
Router.post('/initiate', protect, async (req, res) => {
    try {
        const customerId = req.user.id;
        const { bookingId, amount, returnUrl, websiteUrl } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({ message: 'Booking ID and amount are required' });
        }

        // Verify the booking belongs to this customer
        const bookingResult = await pool.query(
            `SELECT b.*, u.full_name as provider_name, u.email as provider_email,
                    c.full_name as customer_name, c.email as customer_email, c.phone as customer_phone,
                    sc.name as service_name
             FROM bookings b
             JOIN users u ON b.provider_id = u.id
             JOIN users c ON b.customer_id = c.id
             LEFT JOIN service_providers sp ON b.provider_id = sp.id
             LEFT JOIN service_categories sc ON sp.service_category_id = sc.id
             WHERE b.id = $1 AND b.customer_id = $2`,
            [bookingId, customerId]
        );

        if (bookingResult.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const booking = bookingResult.rows[0];

        // Check if booking is in a payable state
        if (!['accepted', 'in_progress', 'completed'].includes(booking.status)) {
            return res.status(400).json({ message: 'Booking is not ready for payment' });
        }

        // Check if payment already exists for this booking
        const existingPayment = await pool.query(
            'SELECT * FROM payments WHERE booking_id = $1 AND status = $2',
            [bookingId, 'completed']
        );

        if (existingPayment.rows.length > 0) {
            return res.status(400).json({ message: 'Payment has already been made for this booking' });
        }

        // Generate a unique purchase order ID
        const purchaseOrderId = `SKILLLINK-${bookingId.substring(0, 8)}-${Date.now()}`;

        // Prepare Khalti payment initiation payload
        const khaltiPayload = {
            return_url: returnUrl || `${process.env.CLIENT_URL}/payment/verify`,
            website_url: websiteUrl || process.env.CLIENT_URL,
            amount: Math.round(amount * 100), // Khalti expects amount in paisa
            purchase_order_id: purchaseOrderId,
            purchase_order_name: `${booking.service_name || 'Service'} - ${booking.problem_description?.substring(0, 50) || 'Booking'}`,
            customer_info: {
                name: booking.customer_name,
                email: booking.customer_email,
                phone: booking.customer_phone?.replace(/[^0-9]/g, '').slice(-10) || '9800000000'
            },
            product_details: [
                {
                    identity: bookingId,
                    name: booking.service_name || 'Service',
                    total_price: Math.round(amount * 100),
                    quantity: 1,
                    unit_price: Math.round(amount * 100)
                }
            ]
        };

        // Call Khalti API to initiate payment
        const khaltiResponse = await khaltiRequest('/epayment/initiate/', khaltiPayload);

        if (khaltiResponse.error) {
            console.error('Khalti initiation error:', khaltiResponse);
            return res.status(400).json({ 
                message: khaltiResponse.detail || 'Failed to initiate payment',
                error: khaltiResponse
            });
        }

        // Store the payment record in database
        await pool.query(
            `INSERT INTO payments (booking_id, customer_id, provider_id, amount, purchase_order_id, khalti_pidx, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [bookingId, customerId, booking.provider_id, amount, purchaseOrderId, khaltiResponse.pidx, 'initiated']
        );

        res.json({
            success: true,
            paymentUrl: khaltiResponse.payment_url,
            pidx: khaltiResponse.pidx,
            purchaseOrderId: purchaseOrderId,
            expiresAt: khaltiResponse.expires_at
        });
    } catch (error) {
        console.error('Initiate payment error:', error);
        res.status(500).json({ message: 'Error initiating payment' });
    }
});

// Verify Khalti payment (called after redirect from Khalti)
Router.post('/verify', protect, async (req, res) => {
    try {
        const { pidx } = req.body;

        if (!pidx) {
            return res.status(400).json({ message: 'Payment ID (pidx) is required' });
        }

        // Look up payment by pidx
        const paymentResult = await pool.query(
            'SELECT * FROM payments WHERE khalti_pidx = $1',
            [pidx]
        );

        if (paymentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        const payment = paymentResult.rows[0];

        // Verify payment with Khalti
        const verifyResponse = await khaltiRequest('/epayment/lookup/', { pidx });

        if (verifyResponse.error) {
            console.error('Khalti verification error:', verifyResponse);
            return res.status(400).json({ 
                message: 'Payment verification failed',
                error: verifyResponse
            });
        }

        // Check if payment was successful
        if (verifyResponse.status === 'Completed') {
            // Generate 6-digit completion OTP
            const completionOtp = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Update payment status in database with completion OTP
            await pool.query(
                `UPDATE payments 
                 SET status = 'completed', 
                     khalti_transaction_id = $1,
                     khalti_fee = $2,
                     completion_otp = $3,
                     paid_at = NOW(),
                     updated_at = NOW()
                 WHERE khalti_pidx = $4`,
                [verifyResponse.transaction_id, verifyResponse.fee_breakdown?.total_fee || 0, completionOtp, pidx]
            );

            // Update booking payment status (but NOT completed yet - waiting for OTP verification)
            await pool.query(
                `UPDATE bookings 
                 SET payment_status = 'paid', 
                     paid_at = NOW(),
                     updated_at = NOW()
                 WHERE id = $1`,
                [payment.booking_id]
            );

            // Note: Provider earnings will be updated only after OTP verification

            res.json({ 
                success: true,
                message: 'Payment verified successfully',
                status: 'completed',
                transactionId: verifyResponse.transaction_id,
                amount: verifyResponse.total_amount / 100, // Convert back from paisa
                paidAt: new Date(),
                completionOtp: completionOtp, // Send OTP to customer
                bookingId: payment.booking_id
            });
        } else if (verifyResponse.status === 'Pending') {
            res.json({
                success: false,
                message: 'Payment is still pending',
                status: 'pending'
            });
        } else if (verifyResponse.status === 'Expired') {
            await pool.query(
                `UPDATE payments SET status = 'expired', updated_at = NOW() WHERE khalti_pidx = $1`,
                [pidx]
            );
            res.json({
                success: false,
                message: 'Payment has expired',
                status: 'expired'
            });
        } else {
            const statusStr = verifyResponse.status ? String(verifyResponse.status).toLowerCase() : 'unknown';
            res.json({
                success: false,
                message: `Payment status: ${verifyResponse.status || 'Unknown'}`,
                status: statusStr
            });
        }
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
});

// Verify payment from URL params (GET - for redirect handling)
Router.get('/verify', protect, async (req, res) => {
    try {
        const { pidx, status, purchase_order_id } = req.query;

        if (!pidx) {
            return res.status(400).json({ message: 'Payment ID (pidx) is required' });
        }

        // Look up payment by pidx
        const paymentResult = await pool.query(
            'SELECT * FROM payments WHERE khalti_pidx = $1',
            [pidx]
        );

        if (paymentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        const payment = paymentResult.rows[0];

        // Verify payment with Khalti
        const verifyResponse = await khaltiRequest('/epayment/lookup/', { pidx });

        if (verifyResponse.status === 'Completed') {
            // Generate 6-digit completion OTP
            const completionOtp = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Update payment status with completion OTP
            await pool.query(
                `UPDATE payments 
                 SET status = 'completed', 
                     khalti_transaction_id = $1,
                     khalti_fee = $2,
                     completion_otp = $3,
                     paid_at = NOW(),
                     updated_at = NOW()
                 WHERE khalti_pidx = $4`,
                [verifyResponse.transaction_id, verifyResponse.fee_breakdown?.total_fee || 0, completionOtp, pidx]
            );

            // Update booking payment status
            await pool.query(
                `UPDATE bookings 
                 SET payment_status = 'paid', 
                     paid_at = NOW(),
                     updated_at = NOW()
                 WHERE id = $1`,
                [payment.booking_id]
            );
        }

        // Get the updated payment with OTP
        const updatedPayment = await pool.query(
            'SELECT completion_otp FROM payments WHERE khalti_pidx = $1',
            [pidx]
        );

        res.json({
            success: verifyResponse.status === 'Completed',
            status: verifyResponse.status?.toLowerCase() || 'unknown',
            bookingId: payment.booking_id,
            amount: payment.amount,
            transactionId: verifyResponse.transaction_id,
            completionOtp: updatedPayment.rows[0]?.completion_otp || null
        });
    } catch (error) {
        console.error('Verify payment (GET) error:', error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
});

// Get payment status by pidx (for polling)
Router.get('/status/:pidx', protect, async (req, res) => {
    try {
        const { pidx } = req.params;

        const paymentResult = await pool.query(
            `SELECT p.*, b.problem_description, b.status as booking_status
             FROM payments p
             JOIN bookings b ON p.booking_id = b.id
             WHERE p.khalti_pidx = $1`,
            [pidx]
        );

        if (paymentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        const payment = paymentResult.rows[0];
        res.json({
            status: payment.status,
            amount: payment.amount,
            paidAt: payment.paid_at,
            transactionId: payment.khalti_transaction_id
        });
    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({ message: 'Error getting payment status' });
    }
});

// Verify completion OTP (Provider enters OTP to complete the work)
Router.post('/verify-completion-otp', protect, async (req, res) => {
    try {
        const providerId = req.user.id;
        const { bookingId, otp } = req.body;

        if (!bookingId || !otp) {
            return res.status(400).json({ message: 'Booking ID and OTP are required' });
        }

        // Get payment for this booking
        const paymentResult = await pool.query(
            `SELECT p.*, b.status as booking_status 
             FROM payments p
             JOIN bookings b ON p.booking_id = b.id
             WHERE p.booking_id = $1 AND p.provider_id = $2 AND p.status = 'completed'`,
            [bookingId, providerId]
        );

        if (paymentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Payment not found for this booking' });
        }

        const payment = paymentResult.rows[0];

        // Check if already finalized
        if (payment.otp_verified) {
            return res.status(400).json({ message: 'This booking has already been finalized' });
        }

        // Verify the OTP
        if (payment.completion_otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
        }

        // OTP is correct - finalize the transaction
        // Update payment as OTP verified
        await pool.query(
            `UPDATE payments 
             SET otp_verified = true,
                 otp_verified_at = NOW(),
                 updated_at = NOW()
             WHERE id = $1`,
            [payment.id]
        );

        // Update booking status to completed
        await pool.query(
            `UPDATE bookings 
             SET status = 'completed',
                 payment_status = 'finalized',
                 completed_at = NOW(),
                 updated_at = NOW()
             WHERE id = $1`,
            [bookingId]
        );

        // Provider receives 100% of the payment
        const providerEarning = payment.amount;
        await pool.query(
            `UPDATE service_providers 
             SET total_earnings = total_earnings + $1,
                 pending_earnings = pending_earnings + $1,
                 total_completed_jobs = total_completed_jobs + 1
             WHERE id = $2`,
            [providerEarning, providerId]
        );

        res.json({
            success: true,
            message: 'Work completed and payment finalized successfully!',
            amount: payment.amount,
            earnings: providerEarning
        });
    } catch (error) {
        console.error('Verify completion OTP error:', error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
});

// Get completion OTP for customer (to show after payment)
Router.get('/completion-otp/:bookingId', protect, async (req, res) => {
    try {
        const customerId = req.user.id;
        const { bookingId } = req.params;

        const result = await pool.query(
            `SELECT completion_otp, otp_verified, status 
             FROM payments 
             WHERE booking_id = $1 AND customer_id = $2 AND status = 'completed'
             ORDER BY created_at DESC LIMIT 1`,
            [bookingId, customerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No completed payment found' });
        }

        const payment = result.rows[0];

        if (payment.otp_verified) {
            return res.json({
                completionOtp: null,
                message: 'Work has been completed and verified',
                verified: true
            });
        }

        res.json({
            completionOtp: payment.completion_otp,
            verified: false,
            message: 'Share this OTP with your service provider after work is completed'
        });
    } catch (error) {
        console.error('Get completion OTP error:', error);
        res.status(500).json({ message: 'Error getting completion OTP' });
    }
});

// Get payment details for a booking
Router.get('/booking/:bookingId', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookingId } = req.params;

        const result = await pool.query(
            `SELECT p.*, b.problem_description, b.status as booking_status,
                    u.full_name as provider_name
             FROM payments p
             JOIN bookings b ON p.booking_id = b.id
             JOIN users u ON p.provider_id = u.id
             WHERE p.booking_id = $1 AND (p.customer_id = $2 OR p.provider_id = $2)
             ORDER BY p.created_at DESC
             LIMIT 1`,
            [bookingId, userId]
        );

        if (result.rows.length === 0) {
            return res.json({ payment: null });
        }

        const payment = result.rows[0];
        res.json({
            payment: {
                id: payment.id,
                amount: payment.amount,
                status: payment.status,
                paidAt: payment.paid_at,
                transactionId: payment.khalti_transaction_id,
                providerName: payment.provider_name,
                bookingDescription: payment.problem_description
            }
        });
    } catch (error) {
        console.error('Get payment details error:', error);
        res.status(500).json({ message: 'Error getting payment details' });
    }
});

// Get payment history for user
Router.get('/history', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query;
        if (userRole === 'customer') {
            query = `
                SELECT p.*, b.problem_description, b.status as booking_status,
                       u.full_name as other_party_name, sc.name as service_name
                FROM payments p
                JOIN bookings b ON p.booking_id = b.id
                JOIN users u ON p.provider_id = u.id
                LEFT JOIN service_providers sp ON p.provider_id = sp.id
                LEFT JOIN service_categories sc ON sp.service_category_id = sc.id
                WHERE p.customer_id = $1
                ORDER BY p.created_at DESC
            `;
        } else if (userRole === 'service_provider') {
            query = `
                SELECT p.*, b.problem_description, b.status as booking_status,
                       u.full_name as other_party_name, sc.name as service_name
                FROM payments p
                JOIN bookings b ON p.booking_id = b.id
                JOIN users u ON p.customer_id = u.id
                LEFT JOIN service_providers sp ON p.provider_id = sp.id
                LEFT JOIN service_categories sc ON sp.service_category_id = sc.id
                WHERE p.provider_id = $1
                ORDER BY p.created_at DESC
            `;
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const result = await pool.query(query, [userId]);

        const payments = result.rows.map(p => ({
            id: p.id,
            bookingId: p.booking_id,
            amount: p.amount,
            status: p.status,
            paidAt: p.paid_at,
            createdAt: p.created_at,
            transactionId: p.khalti_transaction_id,
            otherPartyName: p.other_party_name,
            serviceName: p.service_name,
            bookingDescription: p.problem_description
        }));

        res.json({ payments });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({ message: 'Error getting payment history' });
    }
});

// Request refund (for cancelled bookings)
Router.post('/refund', protect, async (req, res) => {
    try {
        const customerId = req.user.id;
        const { bookingId, reason } = req.body;

        // Get payment for this booking
        const paymentResult = await pool.query(
            `SELECT p.*, b.status as booking_status
             FROM payments p
             JOIN bookings b ON p.booking_id = b.id
             WHERE p.booking_id = $1 AND p.customer_id = $2 AND p.status = 'completed'`,
            [bookingId, customerId]
        );

        if (paymentResult.rows.length === 0) {
            return res.status(404).json({ message: 'No successful payment found for this booking' });
        }

        const payment = paymentResult.rows[0];

        // Only allow refund for cancelled bookings
        if (!['cancelled', 'rejected'].includes(payment.booking_status)) {
            return res.status(400).json({ message: 'Refund is only available for cancelled or rejected bookings' });
        }

        // Note: Khalti refunds need to be processed manually through their dashboard
        // We'll mark it as refund_requested and admin will process it
        await pool.query(
            `UPDATE payments 
             SET status = 'refund_requested', 
                 refund_reason = $1,
                 updated_at = NOW()
             WHERE id = $2`,
            [reason || 'Customer requested refund', payment.id]
        );

        // Update booking payment status
        await pool.query(
            `UPDATE bookings 
             SET payment_status = 'refund_requested', 
                 updated_at = NOW()
             WHERE id = $1`,
            [bookingId]
        );

        res.json({ 
            message: 'Refund request submitted. Our team will process it within 3-5 business days.',
            status: 'refund_requested'
        });
    } catch (error) {
        console.error('Refund request error:', error);
        res.status(500).json({ message: 'Error processing refund request' });
    }
});

export default Router;

import express from 'express';
import pool from '../Services/db.js';
import { protect, adminOnly } from '../middleWear/auth.js';

const Router = express.Router();

// Apply protect and adminOnly middleware to all admin routes
Router.use(protect);
Router.use(adminOnly);

// Get all users with their details
Router.get('/users', async (req, res) => {
    try {
        const { role, status } = req.query;
        
        let query = `
            SELECT 
                u.id, 
                u.full_name, 
                u.email, 
                u.phone, 
                u.role, 
                u.is_active,
                u.created_at
            FROM users u
            WHERE 1=1
        `;
        const params = [];
        
        if (role) {
            params.push(role);
            query += ` AND u.role = $${params.length}`;
        }
        
        if (status === 'active') {
            query += ' AND u.is_active = TRUE';
        } else if (status === 'suspended') {
            query += ' AND u.is_active = FALSE';
        }
        
        query += ' ORDER BY u.created_at DESC';
        
        const users = await pool.query(query, params);
        res.json({ users: users.rows });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Get specific user details
Router.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const userQuery = await pool.query(
            `SELECT 
                u.id, 
                u.full_name, 
                u.email, 
                u.phone, 
                u.role, 
                u.is_active,
                u.created_at
            FROM users u
            WHERE u.id = $1`,
            [userId]
        );
        
        if (userQuery.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const user = userQuery.rows[0];
        
        // If user is a service provider, get additional details
        if (user.role === 'service_provider') {
            const providerQuery = await pool.query(
                `SELECT 
                    sp.id,
                    sp.hourly_rate,
                    sp.years_of_experience,
                    sp.bio,
                    sp.certificate_upload_date,
                    sc.name as service_category,
                    ARRAY_AGG(spl.location) as locations
                FROM service_providers sp
                LEFT JOIN service_categories sc ON sp.service_category_id = sc.id
                LEFT JOIN service_provider_locations spl ON sp.id = spl.provider_id
                WHERE sp.id = $1
                GROUP BY sp.id, sp.hourly_rate, sp.years_of_experience, sp.bio, 
                         sp.certificate_upload_date, sc.name`,
                [userId]
            );
            
            if (providerQuery.rows.length > 0) {
                user.provider_details = providerQuery.rows[0];
            }
        }
        
        res.json({ user });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ message: 'Error fetching user details' });
    }
});

// Get provider certificate
Router.get('/providers/:providerId/certificate', async (req, res) => {
    try {
        const { providerId } = req.params;
        
        const result = await pool.query(
            'SELECT certificate_file FROM service_providers WHERE id = $1',
            [providerId]
        );
        
        if (result.rows.length === 0 || !result.rows[0].certificate_file) {
            return res.status(404).json({ message: 'Certificate not found' });
        }
        
        const certificate = result.rows[0].certificate_file;
        
        // Send as base64 for easy display in frontend
        const base64Certificate = certificate.toString('base64');
        res.json({ certificate: base64Certificate });
    } catch (error) {
        console.error('Get certificate error:', error);
        res.status(500).json({ message: 'Error fetching certificate' });
    }
});

// Suspend/Activate user
Router.patch('/users/:userId/status', async (req, res) => {
    try {
        const { userId } = req.params;
        const { is_active } = req.body;
        
        if (typeof is_active !== 'boolean') {
            return res.status(400).json({ message: 'is_active must be a boolean' });
        }
        
        // Prevent admin from suspending themselves
        if (userId === req.user.id) {
            return res.status(400).json({ message: 'Cannot change your own account status' });
        }
        
        const result = await pool.query(
            'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, full_name, email, role, is_active',
            [is_active, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ 
            message: is_active ? 'User activated successfully' : 'User suspended successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Error updating user status' });
    }
});

// Get statistics
Router.get('/stats', async (req, res) => {
    try {
        const userStats = await pool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE role = 'customer') as total_customers,
                COUNT(*) FILTER (WHERE role = 'service_provider') as total_providers,
                COUNT(*) FILTER (WHERE is_active = TRUE) as active_users,
                COUNT(*) FILTER (WHERE is_active = FALSE) as suspended_users
            FROM users
        `);
        
        // Get gross transaction stats
        const transactionStats = await pool.query(`
            SELECT 
                COALESCE(SUM(amount), 0) as gross_transactions,
                COUNT(*) as total_transactions,
                COUNT(*) FILTER (WHERE status = 'completed') as completed_transactions,
                COUNT(*) FILTER (WHERE status = 'pending') as pending_transactions,
                COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as completed_amount
            FROM payments
        `);
        
        const stats = {
            ...userStats.rows[0],
            ...transactionStats.rows[0]
        };
        
        res.json({ stats });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

export default Router;

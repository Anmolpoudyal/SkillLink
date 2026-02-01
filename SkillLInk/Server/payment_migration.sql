-- ============================================
-- KHALTI PAYMENT FEATURE DATABASE UPDATES
-- Run this migration to add payment support
-- ============================================

-- Add payment status to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;

-- Create payments table for Khalti integration
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    
    -- Payment details
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NPR',
    
    -- Khalti integration fields
    purchase_order_id VARCHAR(100),
    khalti_pidx VARCHAR(100),           -- Khalti payment ID
    khalti_transaction_id VARCHAR(100),  -- Transaction ID after success
    khalti_fee NUMERIC(10,2),            -- Khalti fee amount
    
    -- Status: initiated, pending, completed, failed, expired, refund_requested, refunded
    status VARCHAR(20) DEFAULT 'initiated',
    
    -- Refund tracking
    refund_reason TEXT,
    refunded_at TIMESTAMP,
    
    -- Timestamps
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(provider_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_khalti_pidx ON payments(khalti_pidx);
CREATE INDEX IF NOT EXISTS idx_payments_purchase_order ON payments(purchase_order_id);

-- Add bank details to service providers for payouts
ALTER TABLE service_providers
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS bank_account_holder VARCHAR(255),
ADD COLUMN IF NOT EXISTS pending_earnings NUMERIC(12,2) DEFAULT 0.0;

-- Create payout tracking table (for provider payouts)
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    
    -- Payout details
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NPR',
    
    -- Bank/payment details
    payout_method VARCHAR(50) DEFAULT 'bank_transfer',
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    account_holder_name VARCHAR(255),
    
    -- Status: pending, processing, completed, failed
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Reference
    reference_number VARCHAR(100),
    notes TEXT,
    
    -- Timestamps
    requested_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_provider ON payouts(provider_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- You can insert test payments after running this migration
-- Example:
-- INSERT INTO payments (booking_id, customer_id, provider_id, amount, status)
-- VALUES ('booking-uuid', 'customer-uuid', 'provider-uuid', 1500, 'completed');

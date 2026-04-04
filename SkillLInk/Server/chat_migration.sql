-- Migration: add persisted booking chat messages

CREATE TABLE IF NOT EXISTS booking_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_messages_booking
ON booking_messages(booking_id, created_at);

CREATE TABLE IF NOT EXISTS direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CHECK (sender_id <> receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_receiver
ON direct_messages(sender_id, receiver_id, created_at);

CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_sender
ON direct_messages(receiver_id, sender_id, created_at);

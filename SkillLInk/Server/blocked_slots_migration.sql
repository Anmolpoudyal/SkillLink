-- Migration: Add unique constraint to provider_blocked_slots table
-- Run this if the table already exists without the constraint

-- First, remove any duplicate entries (keep the latest one)
DELETE FROM provider_blocked_slots a
USING provider_blocked_slots b
WHERE a.id < b.id
  AND a.provider_id = b.provider_id
  AND a.blocked_date = b.blocked_date;

-- Add the unique constraint
ALTER TABLE provider_blocked_slots
ADD CONSTRAINT provider_blocked_slots_provider_date_unique 
UNIQUE (provider_id, blocked_date);

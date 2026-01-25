CREATE TYPE user_role AS ENUM ('admin', 'customer', 'service_provider');
CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  profile_photo TEXT,  -- URL or base64 encoded image
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE service_providers (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  service_category_id UUID REFERENCES service_categories(id),
  hourly_rate NUMERIC(10,2),
  years_of_experience INT,
  bio TEXT,

  -- Certificate stored directly in PostgreSQL
  certificate_file BYTEA,                   -- actual file (PDF/image)
  certificate_upload_date TIMESTAMP DEFAULT NOW(),
  
  -- Aggregated stats (updated via triggers or application logic)
  total_reviews INT DEFAULT 0,
  average_rating NUMERIC(2,1) DEFAULT 0.0,
  total_completed_jobs INT DEFAULT 0,
  total_earnings NUMERIC(12,2) DEFAULT 0.0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE service_provider_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  location VARCHAR(255) NOT NULL
);

-- Provider weekly availability schedule
CREATE TABLE provider_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  is_available BOOLEAN DEFAULT TRUE,
  start_time TIME,
  end_time TIME,
  UNIQUE(provider_id, day_of_week)
);

-- Provider blocked time slots (for vacations, appointments, etc.)
CREATE TABLE provider_blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  
  -- Booking details
  problem_description TEXT NOT NULL,
  service_address TEXT NOT NULL,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  
  -- Schedule
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  scheduled_date DATE,
  scheduled_time TIME,
  
  -- Status and verification
  status booking_status DEFAULT 'pending',
  verification_code VARCHAR(6),  -- 6-digit OTP for completion
  
  -- Payment
  estimated_amount NUMERIC(10,2),
  final_amount NUMERIC(10,2),
  
  -- Provider response
  provider_notes TEXT,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews and ratings
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reports against providers
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  reason VARCHAR(255) NOT NULL,
  description TEXT,
  status report_status DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_reviews_provider ON reviews(provider_id);
CREATE INDEX idx_reports_provider ON reports(provider_id);
CREATE INDEX idx_provider_availability ON provider_availability(provider_id);
CREATE INDEX idx_provider_blocked_slots ON provider_blocked_slots(provider_id, blocked_date);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Service categories
INSERT INTO service_categories (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Electrician'),
  ('22222222-2222-2222-2222-222222222222', 'Plumber'),
  ('33333333-3333-3333-3333-333333333333', 'Carpenter'),
  ('44444444-4444-4444-4444-444444444444', 'AC Repair'),
  ('55555555-5555-5555-5555-555555555555', 'Painter'),
  ('66666666-6666-6666-6666-666666666666', 'Cleaner'),
  ('77777777-7777-7777-7777-777777777777', 'Appliance Repair');

-- Sample admin user (password: admin123)
INSERT INTO users (id, full_name, email, phone, password_hash, role) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Admin User', 'admin@skilllink.com', '+977 9800000000', '$2b$10$98pKUfhnnjaPVE4e1o/DxOBsUmzlR28KfyMrwlkm8jkqtp0JAfVb2', 'admin');

-- Sample customers (password: password123)
INSERT INTO users (id, full_name, email, phone, password_hash, role, address) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccc01', 'Ramesh Kumar', 'ramesh@email.com', '+977 9812345678', '$2b$10$3NGo/k10Pq5q1Hbt/r5us.Xv37OXxrngJBr/ZzBu5.UxFqPjZniDS', 'customer', 'Kathmandu, Nepal'),
  ('cccccccc-cccc-cccc-cccc-cccccccccc02', 'Suman Thapa', 'suman@email.com', '+977 9823456789', '$2b$10$3NGo/k10Pq5q1Hbt/r5us.Xv37OXxrngJBr/ZzBu5.UxFqPjZniDS', 'customer', 'Lalitpur, Nepal'),
  ('cccccccc-cccc-cccc-cccc-cccccccccc03', 'Amit Poudel', 'amit@email.com', '+977 9834567890', '$2b$10$3NGo/k10Pq5q1Hbt/r5us.Xv37OXxrngJBr/ZzBu5.UxFqPjZniDS', 'customer', 'Bhaktapur, Nepal');

-- Sample service providers (password: password123)
INSERT INTO users (id, full_name, email, phone, password_hash, role, address) VALUES
  ('pppppppp-pppp-pppp-pppp-pppppppppp01', 'Ram Sharma', 'ram.sharma@email.com', '+977 9841234567', '$2b$10$3NGo/k10Pq5q1Hbt/r5us.Xv37OXxrngJBr/ZzBu5.UxFqPjZniDS', 'service_provider', 'Kathmandu, Nepal'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp02', 'Sita Thapa', 'sita.thapa@email.com', '+977 9851234567', '$2b$10$3NGo/k10Pq5q1Hbt/r5us.Xv37OXxrngJBr/ZzBu5.UxFqPjZniDS', 'service_provider', 'Lalitpur, Nepal'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp03', 'Hari Bahadur', 'hari.bahadur@email.com', '+977 9861234567', '$2b$10$3NGo/k10Pq5q1Hbt/r5us.Xv37OXxrngJBr/ZzBu5.UxFqPjZniDS', 'service_provider', 'Kathmandu, Nepal'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp04', 'Gita Rai', 'gita.rai@email.com', '+977 9871234567', '$2b$10$3NGo/k10Pq5q1Hbt/r5us.Xv37OXxrngJBr/ZzBu5.UxFqPjZniDS', 'service_provider', 'Bhaktapur, Nepal'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp05', 'Krishna Tamang', 'krishna.tamang@email.com', '+977 9881234567', '$2b$10$3NGo/k10Pq5q1Hbt/r5us.Xv37OXxrngJBr/ZzBu5.UxFqPjZniDS', 'service_provider', 'Kathmandu, Nepal');

-- Service provider details
INSERT INTO service_providers (id, service_category_id, hourly_rate, years_of_experience, bio, total_reviews, average_rating, total_completed_jobs, total_earnings) VALUES
  ('pppppppp-pppp-pppp-pppp-pppppppppp01', '11111111-1111-1111-1111-111111111111', 600, 8, 'Professional electrician with over 8 years of experience in residential and commercial electrical work. Specialized in wiring, panel installations, and LED fixture setups. Committed to safety and quality workmanship.', 124, 4.8, 150, 45600),
  ('pppppppp-pppp-pppp-pppp-pppppppppp02', '22222222-2222-2222-2222-222222222222', 500, 5, 'Experienced plumber specializing in pipe fitting, leak repairs, and bathroom installations. Quick response time and reliable service.', 98, 4.9, 120, 38000),
  ('pppppppp-pppp-pppp-pppp-pppppppppp03', '33333333-3333-3333-3333-333333333333', 550, 10, 'Master carpenter with expertise in custom furniture, door installations, and wood repairs. Quality craftsmanship guaranteed.', 156, 4.7, 180, 52000),
  ('pppppppp-pppp-pppp-pppp-pppppppppp04', '44444444-4444-4444-4444-444444444444', 700, 6, 'AC repair specialist with training from top brands. Expert in installation, maintenance, and troubleshooting of all AC types.', 87, 4.9, 95, 42000),
  ('pppppppp-pppp-pppp-pppp-pppppppppp05', '11111111-1111-1111-1111-111111111111', 650, 7, 'Certified electrician offering complete electrical solutions. Specializing in smart home installations and energy-efficient solutions.', 143, 4.6, 165, 48500);

-- Provider locations
INSERT INTO service_provider_locations (provider_id, location) VALUES
  ('pppppppp-pppp-pppp-pppp-pppppppppp01', 'Kathmandu'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp02', 'Lalitpur'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp03', 'Kathmandu'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp04', 'Bhaktapur'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp05', 'Kathmandu');

-- Provider availability (Mon-Fri 9-6, Sat 10-4, Sun off for most)
INSERT INTO provider_availability (provider_id, day_of_week, is_available, start_time, end_time) VALUES
  -- Ram Sharma (provider 01)
  ('pppppppp-pppp-pppp-pppp-pppppppppp01', 0, FALSE, NULL, NULL),  -- Sunday off
  ('pppppppp-pppp-pppp-pppp-pppppppppp01', 1, TRUE, '09:00', '18:00'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp01', 2, TRUE, '09:00', '18:00'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp01', 3, TRUE, '09:00', '18:00'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp01', 4, TRUE, '09:00', '18:00'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp01', 5, TRUE, '09:00', '18:00'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp01', 6, TRUE, '10:00', '16:00'),
  -- Sita Thapa (provider 02)
  ('pppppppp-pppp-pppp-pppp-pppppppppp02', 0, FALSE, NULL, NULL),
  ('pppppppp-pppp-pppp-pppp-pppppppppp02', 1, TRUE, '09:00', '18:00'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp02', 2, TRUE, '09:00', '18:00'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp02', 3, TRUE, '09:00', '18:00'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp02', 4, TRUE, '09:00', '18:00'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp02', 5, TRUE, '09:00', '18:00'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp02', 6, TRUE, '10:00', '16:00');

-- Sample blocked slots
INSERT INTO provider_blocked_slots (provider_id, blocked_date, start_time, end_time, reason) VALUES
  ('pppppppp-pppp-pppp-pppp-pppppppppp01', '2026-01-20', '08:00', '12:00', 'Personal appointment'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp01', '2026-02-14', '09:00', '18:00', 'Holiday');

-- Sample bookings
INSERT INTO bookings (id, customer_id, provider_id, problem_description, service_address, latitude, longitude, preferred_date, preferred_time, status, verification_code, estimated_amount, created_at) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'cccccccc-cccc-cccc-cccc-cccccccccc01', 'pppppppp-pppp-pppp-pppp-pppppppppp01', 'Ceiling fan not working', 'Thamel, Kathmandu', 27.7172, 85.3240, '2026-01-15', '10:00', 'pending', NULL, 1200, NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'cccccccc-cccc-cccc-cccc-cccccccccc01', 'pppppppp-pppp-pppp-pppp-pppppppppp02', 'Kitchen sink leaking', 'Patan, Lalitpur', 27.6588, 85.3247, '2026-01-12', '14:00', 'in_progress', '582914', 1500, NOW() - INTERVAL '3 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 'cccccccc-cccc-cccc-cccc-cccccccccc01', 'pppppppp-pppp-pppp-pppp-pppppppppp03', 'Door repair needed', 'Bhaktapur Durbar Square', 27.6710, 85.4298, '2026-01-05', '09:00', 'completed', '123456', 2000, NOW() - INTERVAL '20 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04', 'cccccccc-cccc-cccc-cccc-cccccccccc02', 'pppppppp-pppp-pppp-pppp-pppppppppp01', 'Electrical wiring issue', 'New Road, Kathmandu', 27.7025, 85.3119, '2026-01-18', '11:00', 'pending', NULL, 1800, NOW());

-- Sample reviews
INSERT INTO reviews (booking_id, customer_id, provider_id, rating, comment, created_at) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 'cccccccc-cccc-cccc-cccc-cccccccccc01', 'pppppppp-pppp-pppp-pppp-pppppppppp03', 5, 'Excellent work! Completed the door repair professionally. Highly recommended!', NOW() - INTERVAL '18 days');

-- Update completed booking with final amount
UPDATE bookings SET 
  final_amount = 2000, 
  completed_at = NOW() - INTERVAL '18 days',
  scheduled_date = '2026-01-05',
  scheduled_time = '09:00'
WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03';

-- Update in_progress booking with acceptance info
UPDATE bookings SET 
  accepted_at = NOW() - INTERVAL '2 days',
  started_at = NOW() - INTERVAL '1 day',
  scheduled_date = '2026-01-12',
  scheduled_time = '14:00'
WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02';


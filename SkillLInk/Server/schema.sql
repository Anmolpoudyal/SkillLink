CREATE TYPE user_role AS ENUM ('admin', 'customer', 'service_provider');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE service_provider_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  location VARCHAR(255) NOT NULL
);


# Database Setup Commands

## Quick Setup

### Step 1: Create Database
```sql
-- Connect to PostgreSQL as postgres user
-- Then run:

CREATE DATABASE SkillLink;
```

### Step 2: Connect to Database
```sql
\c SkillLink
```

### Step 3: Run the schema
Copy and paste the entire contents of `Server/schema.sql` or run:
```sql
\i Server/schema.sql
```

## Verify Tables Created

```sql
-- List all tables
\dt

-- You should see:
-- users
-- service_categories
-- service_providers
-- service_provider_locations
```

## Sample Data (Optional)

### Create an admin user
```sql
-- Note: Password is 'admin123' hashed with bcrypt
INSERT INTO users (full_name, email, phone, password_hash, role)
VALUES (
  'Admin User',
  'admin@skilllink.com',
  '+9779841234567',
  '$2a$10$X8qVQf3jZ0JHG5YxKp8y5.VYmJ5Nh6QwXmE8zP8yJ5Nh6QwXmE8zP',
  'admin'
);
```

### Create some service categories
```sql
INSERT INTO service_categories (name) VALUES
('Electrician'),
('Plumber'),
('Carpenter'),
('AC Repair'),
('Appliance Repair'),
('Cleaning Service'),
('Painter'),
('Pest Control');
```

## Useful Queries

### View all users
```sql
SELECT id, full_name, email, role, created_at FROM users;
```

### View all providers
```sql
SELECT 
  u.full_name,
  u.email,
  sc.name as service_category,
  sp.hourly_rate,
  sp.years_of_experience
FROM service_providers sp
JOIN users u ON sp.id = u.id
LEFT JOIN service_categories sc ON sp.service_category_id = sc.id;
```

### View provider locations
```sql
SELECT 
  u.full_name,
  spl.location
FROM service_provider_locations spl
JOIN service_providers sp ON spl.provider_id = sp.id
JOIN users u ON sp.id = u.id;
```

### Delete a user (and all related data due to CASCADE)
```sql
DELETE FROM users WHERE email = 'example@email.com';
```

## Troubleshooting

### Reset the database
```sql
DROP DATABASE SkillLink;
CREATE DATABASE SkillLink;
\c SkillLink
-- Then run schema.sql again
```

### Check if enum type exists
```sql
SELECT typname FROM pg_type WHERE typname = 'user_role';
```

### Recreate enum type if needed
```sql
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('admin', 'customer', 'service_provider');
```

# SkillLink Quick Start Guide

## Step-by-Step Setup (Copy and Paste)

### 1. Database Setup
Open PostgreSQL terminal and run:

```sql
CREATE DATABASE SkillLink;
\c SkillLink
```

Then copy and paste the contents of `Server/schema.sql`

### 2. Verify Database Configuration
Open `Server/.env` and ensure these match your setup:
```env
DB_USER=postgres          # Your PostgreSQL username
DB_PASSWORD=1234          # Your PostgreSQL password
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=SkillLink
```

### 3. Install & Run Backend
Open Terminal 1:
```bash
cd Server
npm install
npm run dev
```

You should see:
```
Server is running on port 5000
Connected to the database
```

### 4. Install & Run Frontend
Open Terminal 2:
```bash
cd Front-end
npm install
npm run dev
```

You should see:
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

### 5. Test the Application

#### Test Customer Signup:
1. Open http://localhost:5173
2. Click "Sign up as Customer" or go to http://localhost:5173/customer-signup
3. Fill the form:
   - Full Name: Test Customer
   - Email: customer@test.com
   - Phone: +9779841234567
   - Password: Test123!
   - Confirm Password: Test123!
4. Click "Create Account"
5. Check browser console and network tab
6. Should redirect to home with success message

#### Test Provider Signup:
1. Go to http://localhost:5173/provider-signup
2. Fill Personal Information:
   - Full Name: Test Provider
   - Email: provider@test.com
   - Phone: +9779849876543
   - Password: Test123!
   - Confirm Password: Test123!
3. Fill Service Details:
   - Service Category: Select "Electrician"
   - Locations: Click on "Kathmandu" and "Lalitpur"
   - Hourly Rate: 500
   - Years of Experience: 5
   - Bio: "Experienced electrician"
4. Upload Certificate: Upload any PDF or image
5. Click "Submit Application"
6. Should see success message

#### Test Login:
1. Go to http://localhost:5173/login
2. Select role tab: Customer
3. Email: customer@test.com
4. Password: Test123!
5. Click "Login"
6. Should redirect to home

### 6. Verify in Database

Open PostgreSQL and run:

```sql
\c SkillLink

-- Check users
SELECT id, full_name, email, role FROM users;

-- Check providers
SELECT u.full_name, sc.name as category, sp.hourly_rate 
FROM service_providers sp
JOIN users u ON sp.id = u.id
LEFT JOIN service_categories sc ON sp.service_category_id = sc.id;

-- Check provider locations
SELECT u.full_name, spl.location
FROM service_provider_locations spl
JOIN users u ON spl.provider_id = u.id;
```

## Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is available
netstat -ano | findstr :5000

# If occupied, change port in Server/.env
PORT=5001
```

### Database connection error
```bash
# Test PostgreSQL connection
psql -U postgres -h localhost

# Check if database exists
\l

# Verify credentials in Server/.env
```

### Frontend can't connect to backend
1. Check backend is running on port 5000
2. Check `Front-end/.env` has: `VITE_API_URL=http://localhost:5000`
3. Check browser console for CORS errors
4. Restart frontend server

### "User already exists" error
- Email must be unique
- Either use different email or delete user from database:
```sql
DELETE FROM users WHERE email = 'customer@test.com';
```

## Success Checklist

- [ ] PostgreSQL is running
- [ ] Database "SkillLink" exists
- [ ] All tables created (users, service_categories, service_providers, service_provider_locations)
- [ ] Backend server running on port 5000
- [ ] Frontend running on port 5173
- [ ] Customer signup works
- [ ] Provider signup works
- [ ] Login works
- [ ] Data appears in database

## Next Steps

Once everything is working:
1. Create more providers with different categories
2. Create admin user in database
3. Build provider dashboard
4. Build customer dashboard
5. Implement booking system

## Quick Commands Reference

### Backend
```bash
cd Server
npm run dev          # Start with nodemon (auto-restart)
npm start            # Start normally
```

### Frontend
```bash
cd Front-end
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database
```sql
\c SkillLink                    # Connect to database
\dt                             # List tables
\d users                        # Describe users table
SELECT * FROM users;            # View all users
DELETE FROM users;              # Clear all users
```

---

**Need Help?** Check SETUP_GUIDE.md for detailed information!

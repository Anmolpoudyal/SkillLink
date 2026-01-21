# SkillLink - Setup and Running Guide

## Overview
Your SkillLink application is now fully connected! The frontend React app communicates with the Node.js/Express backend, which connects to a PostgreSQL database.

## What Was Fixed

### Backend Issues
1. ✅ Fixed database schema - added `password_hash` column with default role
2. ✅ Updated auth routes to use correct table names (`users` instead of `customers`)
3. ✅ Added Provider Signup endpoint with certificate upload support
4. ✅ Fixed auth middleware to query `users` table
5. ✅ Added error handling to all routes
6. ✅ Fixed .env configuration

### Frontend Issues
1. ✅ Created API service layer for backend communication
2. ✅ Connected CustomerSignup to backend
3. ✅ Connected ProviderSignup to backend with file upload
4. ✅ Connected Login to backend with role-based authentication
5. ✅ Added loading states to all forms
6. ✅ Created .env file for API URL configuration

## Setup Instructions

### 1. Database Setup

First, create the PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE SkillLink;

# Connect to database
\c SkillLink

# Run the schema file
\i Server/schema.sql

# OR copy and paste the contents of schema.sql
```

### 2. Backend Configuration

The `.env` file in the Server directory is already configured. Update these values if needed:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Update these with your PostgreSQL credentials
DB_HOST=localhost
DB_USER=postgres
DB_PORT=5432
DB_DATABASE=SkillLink
DB_PASSWORD=1234  # Change this to your postgres password

JWT_SECRET=123456  # Change this to a secure random string in production
```

### 3. Install Dependencies

```bash
# Install backend dependencies
cd Server
npm install

# Install frontend dependencies
cd ../Front-end
npm install
```

### 4. Run the Application

**Terminal 1 - Backend Server:**
```bash
cd Server
npm run dev
```
The server will start on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd Front-end
npm run dev
```
The frontend will start on http://localhost:5173

## Testing the Application

### 1. Customer Registration
1. Go to http://localhost:5173
2. Click "Sign up as Customer"
3. Fill in the form:
   - Full Name
   - Email
   - Phone
   - Password
4. Submit and you'll be registered!

### 2. Provider Registration
1. Go to http://localhost:5173
2. Click "Apply as Provider"
3. Fill in the form:
   - Personal Information (name, email, phone, password)
   - Service Details (category, locations, hourly rate, experience, bio)
   - Upload CTEVT Certificate (PDF or image)
4. Submit and you'll be registered!

### 3. Login
1. Go to http://localhost:5173/login
2. Select your role tab (Customer/Provider/Admin)
3. Enter email and password
4. Click Login

## API Endpoints

### Authentication Routes
- `POST /api/auth/CustomerSignup` - Register a new customer
- `POST /api/auth/ProviderSignup` - Register a new service provider
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user

## Database Schema

### Tables Created
1. **users** - Stores all users (customers, providers, admins)
   - id (UUID)
   - full_name
   - email (unique)
   - phone (unique)
   - password_hash
   - role (customer/service_provider/admin)

2. **service_categories** - Service types
   - id (UUID)
   - name

3. **service_providers** - Provider-specific data
   - id (references users.id)
   - service_category_id
   - hourly_rate
   - years_of_experience
   - bio
   - certificate_file (stored as BYTEA)

4. **service_provider_locations** - Provider service locations
   - id (UUID)
   - provider_id
   - location

## Common Issues and Solutions

### Issue: Database connection error
**Solution:** 
- Make sure PostgreSQL is running
- Check your DB credentials in `.env`
- Ensure the database `SkillLink` exists

### Issue: CORS errors
**Solution:** 
- Make sure `CLIENT_URL` in backend `.env` matches your frontend URL
- Ensure credentials: true is set in CORS options

### Issue: "User already exists"
**Solution:** 
- Email must be unique
- Try using a different email address

### Issue: Certificate upload fails
**Solution:** 
- Ensure file is PDF or image format
- Check file size (backend may have limits)

## File Structure

```
SkillLink/
├── Front-end/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CustomerSignup.jsx (✅ Connected to backend)
│   │   │   ├── ProviderSignup.jsx (✅ Connected to backend)
│   │   │   └── Login.jsx (✅ Connected to backend)
│   │   └── services/
│   │       └── api.js (✅ API service layer)
│   └── .env (✅ API URL configuration)
│
└── Server/
    ├── Routes/
    │   └── auth.js (✅ Fixed and enhanced)
    ├── middleWear/
    │   └── auth.js (✅ Fixed)
    ├── Services/
    │   └── db.js (Database connection)
    ├── schema.sql (✅ Updated)
    └── .env (✅ Configuration)
```

## Next Steps

1. **Add more routes** for providers, customers, bookings
2. **Create admin panel** for managing users and approvals
3. **Add image optimization** for certificate uploads
4. **Implement email verification**
5. **Add password reset functionality**
6. **Create provider dashboard**
7. **Create customer dashboard**
8. **Add booking system**

## Security Notes

🔒 **For Production:**
- Change `JWT_SECRET` to a strong random string
- Use HTTPS (set `secure: true` in cookie options)
- Add rate limiting
- Validate and sanitize all inputs
- Add password strength requirements
- Implement refresh tokens
- Add CSRF protection

## Support

If you encounter any issues:
1. Check the browser console for frontend errors
2. Check the terminal running the backend for server errors
3. Verify all environment variables are set correctly
4. Ensure PostgreSQL is running and accessible

---

Your SkillLink application is ready to use! 🎉

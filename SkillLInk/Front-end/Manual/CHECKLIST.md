# SkillLink Setup Checklist

Use this checklist to ensure your SkillLink application is properly set up and running.

## ☑️ Pre-Setup Checklist

### Prerequisites Installed
- [ ] Node.js (v16+) installed
  ```bash
  node --version
  ```
- [ ] npm installed
  ```bash
  npm --version
  ```
- [ ] PostgreSQL (v12+) installed and running
  ```bash
  psql --version
  ```
- [ ] Code editor (VS Code recommended)

---

## ☑️ Database Setup

### PostgreSQL Database
- [ ] PostgreSQL service is running
- [ ] Can connect to PostgreSQL
  ```bash
  psql -U postgres
  ```
- [ ] Created `SkillLink` database
  ```sql
  CREATE DATABASE SkillLink;
  ```
- [ ] Connected to SkillLink database
  ```sql
  \c SkillLink
  ```
- [ ] Ran schema.sql successfully
  ```sql
  \i Server/schema.sql
  ```
- [ ] Verified tables created
  ```sql
  \dt
  ```
  Should show:
  - users
  - service_categories
  - service_providers
  - service_provider_locations

---

## ☑️ Backend Setup

### Environment Configuration
- [ ] Opened `Server/.env` file
- [ ] Updated `DB_USER` (default: postgres)
- [ ] Updated `DB_PASSWORD` (your PostgreSQL password)
- [ ] Updated `DB_DATABASE` (default: SkillLink)
- [ ] Updated `DB_HOST` (default: localhost)
- [ ] Updated `DB_PORT` (default: 5432)
- [ ] Kept `JWT_SECRET` or changed to secure value
- [ ] Kept `PORT` as 5000 or changed if needed

### Dependencies
- [ ] Navigated to Server directory
  ```bash
  cd Server
  ```
- [ ] Installed dependencies
  ```bash
  npm install
  ```
- [ ] No installation errors

### Verify Backend Files
- [ ] `Server/index.js` exists
- [ ] `Server/Routes/auth.js` exists
- [ ] `Server/middleWear/auth.js` exists
- [ ] `Server/Services/db.js` exists
- [ ] `Server/.env` exists
- [ ] `Server/package.json` exists

---

## ☑️ Frontend Setup

### Environment Configuration
- [ ] Verified `Front-end/.env` exists
- [ ] Contains `VITE_API_URL=http://localhost:5000`

### Dependencies
- [ ] Navigated to Front-end directory
  ```bash
  cd Front-end
  ```
- [ ] Installed dependencies
  ```bash
  npm install
  ```
- [ ] No installation errors

### Verify Frontend Files
- [ ] `Front-end/src/pages/CustomerSignup.jsx` exists
- [ ] `Front-end/src/pages/ProviderSignup.jsx` exists
- [ ] `Front-end/src/pages/Login.jsx` exists
- [ ] `Front-end/src/services/api.js` exists
- [ ] `Front-end/package.json` exists

---

## ☑️ Running the Application

### Start Backend
- [ ] Opened Terminal 1
- [ ] Navigated to Server directory
  ```bash
  cd Server
  ```
- [ ] Started backend
  ```bash
  npm run dev
  ```
- [ ] See "Server is running on port 5000"
- [ ] See "Connected to the database"
- [ ] No errors in terminal

### Start Frontend
- [ ] Opened Terminal 2
- [ ] Navigated to Front-end directory
  ```bash
  cd Front-end
  ```
- [ ] Started frontend
  ```bash
  npm run dev
  ```
- [ ] See "Local: http://localhost:5173"
- [ ] No errors in terminal

---

## ☑️ Testing Customer Signup

### Navigate to Customer Signup
- [ ] Opened browser to http://localhost:5173
- [ ] Clicked "Sign up as Customer" OR
- [ ] Went directly to http://localhost:5173/customer-signup

### Fill Form
- [ ] Entered Full Name: "Test Customer"
- [ ] Entered Email: "customer@test.com"
- [ ] Entered Phone: "+9779841234567"
- [ ] Entered Password: "Test123!"
- [ ] Entered Confirm Password: "Test123!"

### Submit and Verify
- [ ] Clicked "Create Account"
- [ ] Button shows "Creating Account..."
- [ ] No errors in browser console
- [ ] Success toast appears
- [ ] Redirected to home page
- [ ] Check backend terminal - should show request
- [ ] Verify in database:
  ```sql
  SELECT * FROM users WHERE email = 'customer@test.com';
  ```

---

## ☑️ Testing Provider Signup

### Navigate to Provider Signup
- [ ] Went to http://localhost:5173/provider-signup

### Fill Personal Information
- [ ] Entered Full Name: "Test Provider"
- [ ] Entered Email: "provider@test.com"
- [ ] Entered Phone: "+9779849876543"
- [ ] Entered Password: "Test123!"
- [ ] Entered Confirm Password: "Test123!"

### Fill Service Details
- [ ] Selected Service Category: "Electrician"
- [ ] Selected Locations: "Kathmandu", "Lalitpur"
- [ ] Entered Hourly Rate: "500"
- [ ] Entered Years of Experience: "5"
- [ ] Entered Bio: "Experienced electrician"

### Upload Certificate
- [ ] Clicked upload area
- [ ] Selected a PDF or image file
- [ ] File name appears with checkmark

### Submit and Verify
- [ ] Clicked "Submit Application"
- [ ] Button shows "Submitting Application..."
- [ ] No errors in browser console
- [ ] Success toast appears
- [ ] Redirected to home page
- [ ] Check backend terminal - should show request
- [ ] Verify in database:
  ```sql
  SELECT u.full_name, u.role, sc.name as category
  FROM users u
  LEFT JOIN service_providers sp ON u.id = sp.id
  LEFT JOIN service_categories sc ON sp.service_category_id = sc.id
  WHERE u.email = 'provider@test.com';
  ```

---

## ☑️ Testing Login

### Navigate to Login
- [ ] Went to http://localhost:5173/login

### Test Customer Login
- [ ] Selected "Customer" tab
- [ ] Entered Email: "customer@test.com"
- [ ] Entered Password: "Test123!"
- [ ] Clicked "Login"
- [ ] Button shows "Logging in..."
- [ ] Success toast appears
- [ ] Redirected appropriately
- [ ] No errors in console

### Test Provider Login
- [ ] Went back to /login
- [ ] Selected "Provider" tab
- [ ] Entered Email: "provider@test.com"
- [ ] Entered Password: "Test123!"
- [ ] Clicked "Login"
- [ ] Success toast appears
- [ ] No errors in console

### Test Wrong Password
- [ ] Tried logging in with wrong password
- [ ] Error message appears: "Invalid email or password"
- [ ] Not redirected

---

## ☑️ Verification Checks

### Browser Developer Tools
- [ ] Opened DevTools (F12)
- [ ] **Console Tab**: No red errors
- [ ] **Network Tab**: 
  - [ ] POST requests to /api/auth/* return 200/201
  - [ ] Responses contain user data
- [ ] **Application Tab** → **Cookies**:
  - [ ] `token` cookie exists for localhost:5000
  - [ ] Cookie has value (JWT)
  - [ ] HttpOnly flag is set
- [ ] **Application Tab** → **Local Storage**:
  - [ ] `userRole` is set
  - [ ] `isLoggedIn` is "true"
  - [ ] `userEmail` is set
  - [ ] `userName` is set

### Database Verification
- [ ] Opened PostgreSQL terminal
  ```bash
  psql -U postgres -d SkillLink
  ```
- [ ] Counted users
  ```sql
  SELECT COUNT(*) FROM users;
  ```
- [ ] Viewed all users
  ```sql
  SELECT id, full_name, email, role FROM users;
  ```
- [ ] Checked provider details
  ```sql
  SELECT u.full_name, sc.name, sp.hourly_rate
  FROM service_providers sp
  JOIN users u ON sp.id = u.id
  LEFT JOIN service_categories sc ON sp.service_category_id = sc.id;
  ```
- [ ] Checked locations
  ```sql
  SELECT u.full_name, spl.location
  FROM service_provider_locations spl
  JOIN users u ON spl.provider_id = u.id;
  ```

### Backend Logs
- [ ] Backend terminal shows:
  - [ ] "Server is running on port 5000"
  - [ ] "Connected to the database"
  - [ ] POST requests logged when signing up/logging in
  - [ ] No error messages

---

## ☑️ Common Issues Resolution

### Issue: Backend won't start
- [ ] Checked port 5000 is not in use
- [ ] Verified all dependencies installed
- [ ] Checked .env file exists and is correct
- [ ] Tried `npm install` again

### Issue: Database connection error
- [ ] Verified PostgreSQL is running
- [ ] Checked credentials in .env
- [ ] Verified database "SkillLink" exists
- [ ] Tested connection with psql

### Issue: Frontend can't connect
- [ ] Verified backend is running
- [ ] Checked .env has correct API URL
- [ ] Cleared browser cache
- [ ] Restarted frontend dev server

### Issue: CORS error
- [ ] Verified CLIENT_URL in backend .env
- [ ] Ensured it matches frontend URL
- [ ] Restarted backend server

---

## ☑️ Documentation Review

### Read Documentation
- [ ] Read [README.md](README.md)
- [ ] Read [SETUP_GUIDE.md](SETUP_GUIDE.md)
- [ ] Skimmed [DATABASE_SETUP.md](DATABASE_SETUP.md)
- [ ] Reviewed [QUICKSTART.md](QUICKSTART.md)
- [ ] Checked [CHANGES.md](CHANGES.md) for what was modified
- [ ] Reviewed [ARCHITECTURE.md](ARCHITECTURE.md) for system design

---

## ☑️ Next Steps

### Features to Build
- [ ] Create provider dashboard page
- [ ] Create customer dashboard page
- [ ] Add logout button in UI
- [ ] Implement profile editing
- [ ] Add protected routes
- [ ] Build service browsing page
- [ ] Create booking system

### Improvements
- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add input validation messages
- [ ] Improve error handling
- [ ] Add loading spinners
- [ ] Create admin panel

---

## ✅ Final Verification

### Everything Working?
- [ ] Backend running without errors
- [ ] Frontend running without errors
- [ ] Database accessible
- [ ] Customer signup works
- [ ] Provider signup works
- [ ] Login works
- [ ] Data appears in database
- [ ] No console errors
- [ ] Cookies being set
- [ ] All documentation read

---

## 🎉 Congratulations!

If all items are checked, your SkillLink application is fully set up and ready for development!

### What You Have Now:
✅ Full-stack application running
✅ Frontend connected to backend
✅ Backend connected to database
✅ Authentication system working
✅ Customer & Provider registration
✅ Login system with role-based auth
✅ Complete documentation

### Get Started Developing:
1. Choose a feature from "Next Steps"
2. Create a new branch (if using git)
3. Start coding!

---

**Need Help?** Refer to the documentation in this repository or check the troubleshooting sections.

**Happy Coding! 🚀**

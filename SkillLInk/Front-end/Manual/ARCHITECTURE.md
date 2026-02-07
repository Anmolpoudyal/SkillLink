# SkillLink Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                     http://localhost:5173                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Customer    │  │  Provider    │  │    Login     │         │
│  │   Signup     │  │   Signup     │  │              │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                 │
│                            │                                    │
│                    ┌───────▼────────┐                          │
│                    │  API Service   │                          │
│                    │   (api.js)     │                          │
│                    └───────┬────────┘                          │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             │ (JSON + Cookies)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      BACKEND (Express)                          │
│                     http://localhost:5000                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Middleware                             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │  │
│  │  │   CORS   │→ │   JSON   │→ │  Cookie  │              │  │
│  │  │          │  │  Parser  │  │  Parser  │              │  │
│  │  └──────────┘  └──────────┘  └──────────┘              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│                            ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Auth Routes                              │  │
│  │  /api/auth/...                                           │  │
│  │                                                          │  │
│  │  • POST /CustomerSignup                                 │  │
│  │  • POST /ProviderSignup                                 │  │
│  │  • POST /login                                          │  │
│  │  • GET  /me        (protected)                          │  │
│  │  • POST /logout                                         │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                           │
│  ┌──────────────────▼───────────────────────────────────────┐  │
│  │              Auth Middleware                             │  │
│  │  • Verify JWT Token                                      │  │
│  │  • Validate User                                         │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                           │
└─────────────────────┼───────────────────────────────────────────┘
                      │
                      │ SQL Queries
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                         │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐        ┌──────────────────────┐           │
│  │     users      │        │ service_categories   │           │
│  ├────────────────┤        ├──────────────────────┤           │
│  │ id             │        │ id                   │           │
│  │ full_name      │        │ name                 │           │
│  │ email          │        └──────────────────────┘           │
│  │ phone          │                                            │
│  │ password_hash  │        ┌──────────────────────┐           │
│  │ role           │        │ service_provider_    │           │
│  │ created_at     │        │      locations       │           │
│  │ updated_at     │        ├──────────────────────┤           │
│  └───────┬────────┘        │ id                   │           │
│          │                 │ provider_id          │           │
│          │                 │ location             │           │
│          │                 └──────────────────────┘           │
│          │                                                     │
│  ┌───────▼─────────────────────────────────────────┐          │
│  │         service_providers                       │          │
│  ├─────────────────────────────────────────────────┤          │
│  │ id (FK → users.id)                              │          │
│  │ service_category_id (FK → service_categories)   │          │
│  │ hourly_rate                                     │          │
│  │ years_of_experience                             │          │
│  │ bio                                             │          │
│  │ certificate_file (BYTEA)                        │          │
│  │ certificate_upload_date                         │          │
│  │ created_at                                      │          │
│  │ updated_at                                      │          │
│  └─────────────────────────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow Diagrams

### Customer Signup Flow

```
User → CustomerSignup.jsx → api.customerSignup() → Backend → Database
                                                       ↓
                              ← ← ← ← ← ← ← ← ← ← ← ← ┘
                              (JWT Cookie + User Data)
                                      ↓
                              localStorage.setItem()
                                      ↓
                               navigate("/")
```

**Detailed Steps:**
1. User fills form in CustomerSignup.jsx
2. Form submits → handleSubmit()
3. Validates password match
4. Calls api.customerSignup() with data
5. POST request to /api/auth/CustomerSignup
6. Backend validates required fields
7. Checks if email exists
8. Hashes password with bcrypt
9. Inserts into users table
10. Generates JWT token
11. Sets HTTP-only cookie
12. Returns user data
13. Frontend stores in localStorage
14. Redirects to home page

### Provider Signup Flow

```
User → ProviderSignup.jsx → File Upload → Base64 Convert
                                              ↓
                          api.providerSignup(data + base64)
                                              ↓
                                          Backend
                                              ↓
                    ┌─────────────────────────┴───────────────────────┐
                    ↓                         ↓                       ↓
              Create User          Create/Get Category      Create Provider
                    ↓                         ↓                       ↓
              users table         service_categories      service_providers
                                                                      ↓
                                                          Add Locations Loop
                                                                      ↓
                                                  service_provider_locations
                                                                      ↓
                              ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ┘
                              (JWT Cookie + User Data)
                                      ↓
                              localStorage.setItem()
                                      ↓
                                 navigate("/")
```

**Detailed Steps:**
1. User fills multi-step form
2. Selects service category
3. Selects multiple locations
4. Uploads certificate file
5. Form submits → handleSubmit()
6. Validates all required fields
7. Converts file to base64
8. Calls api.providerSignup() with complete data
9. POST request to /api/auth/ProviderSignup
10. Backend creates user in users table
11. Gets or creates service category
12. Creates provider profile with certificate
13. Loops through locations and inserts each
14. Generates JWT token
15. Sets HTTP-only cookie
16. Returns user data
17. Frontend stores in localStorage
18. Redirects to home page

### Login Flow

```
User → Login.jsx → api.login() → Backend
                                     ↓
                          Verify Email & Password
                                     ↓
                             Check Role Match
                                     ↓
                            Generate JWT Token
                                     ↓
                   ← ← ← ← ← ← ← ← ← ┘
                   (JWT Cookie + User Data)
                            ↓
                    localStorage.setItem()
                            ↓
               ┌────────────┼────────────┐
               ↓            ↓            ↓
          if admin    if provider   if customer
               ↓            ↓            ↓
         /admin       /provider        /
```

### Protected Route Flow

```
Frontend → GET /api/auth/me → Auth Middleware
                                     ↓
                          Check Cookie for Token
                                     ↓
                          ┌──────────┴──────────┐
                          ↓                     ↓
                    Token Valid          Token Invalid
                          ↓                     ↓
                  Verify with JWT         Return 401
                          ↓                     ↓
                  Query Database          Show Error
                          ↓
                  Return User Data
                          ↓
              ← ← ← ← ← ← ┘
              User Object
```

## Technology Stack Details

### Frontend Stack
```
┌─────────────────────────────────────┐
│          React 19.2.0                │
├─────────────────────────────────────┤
│  • Vite (Build Tool)                │
│  • React Router (Navigation)        │
│  • Tailwind CSS (Styling)           │
│  • Radix UI (Components)            │
│  • Lucide React (Icons)             │
│  • Custom Hooks (useToast)          │
└─────────────────────────────────────┘
```

### Backend Stack
```
┌─────────────────────────────────────┐
│        Express 5.2.1                 │
├─────────────────────────────────────┤
│  • CORS (Cross-Origin)              │
│  • Cookie Parser                    │
│  • bcryptjs (Password Hashing)      │
│  • jsonwebtoken (JWT Auth)          │
│  • dotenv (Environment Variables)   │
│  • pg (PostgreSQL Client)           │
└─────────────────────────────────────┘
```

### Database Stack
```
┌─────────────────────────────────────┐
│         PostgreSQL                   │
├─────────────────────────────────────┤
│  • UUID Primary Keys                │
│  • ENUM Types (user_role)           │
│  • Foreign Key Constraints          │
│  • CASCADE Deletes                  │
│  • BYTEA (File Storage)             │
│  • Timestamps (created_at)          │
└─────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend                                               │
│  ┌────────────────────────────────────────┐            │
│  │ • Input Validation                     │            │
│  │ • Form Validation                      │            │
│  │ • Client-side Password Match           │            │
│  │ • Required Field Checks                │            │
│  └────────────────────────────────────────┘            │
│                                                          │
│  Network                                                │
│  ┌────────────────────────────────────────┐            │
│  │ • CORS Policy                          │            │
│  │ • HTTPS (Production)                   │            │
│  │ • Credentials: Include                 │            │
│  └────────────────────────────────────────┘            │
│                                                          │
│  Backend                                                │
│  ┌────────────────────────────────────────┐            │
│  │ • Server-side Validation               │            │
│  │ • bcrypt Password Hashing (cost: 10)   │            │
│  │ • JWT Token Generation                 │            │
│  │ • HTTP-only Cookies                    │            │
│  │ • SameSite: Strict                     │            │
│  │ • Email Uniqueness Check               │            │
│  │ • Role Validation                      │            │
│  └────────────────────────────────────────┘            │
│                                                          │
│  Database                                               │
│  ┌────────────────────────────────────────┐            │
│  │ • Unique Constraints (email, phone)    │            │
│  │ • Foreign Key Constraints              │            │
│  │ • Data Type Validation                 │            │
│  │ • Password Hash Storage Only           │            │
│  └────────────────────────────────────────┘            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## File Upload Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Certificate Upload Flow                     │
└─────────────────────────────────────────────────────────┘

Frontend (ProviderSignup.jsx)
    ↓
User selects file (PDF/Image)
    ↓
handleFileChange() → stores File object
    ↓
On Submit
    ↓
FileReader.readAsDataURL(file)
    ↓
Convert to Base64 string
    ↓
Remove data:image/pdf;base64, prefix
    ↓
Send base64 string in JSON
    ↓
    ↓
Backend (auth.js)
    ↓
Receive base64 string
    ↓
Buffer.from(base64, 'base64')
    ↓
Store as BYTEA in PostgreSQL
    ↓
    ↓
Database
    ↓
certificate_file column (BYTEA type)
Stores binary data directly
```

## Environment Configuration

```
┌─────────────────────────────────────────────────────────┐
│               Environment Variables                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (.env)                                        │
│  ┌────────────────────────────────────────┐            │
│  │ VITE_API_URL=http://localhost:5000     │            │
│  └────────────────────────────────────────┘            │
│                                                          │
│  Backend (.env)                                         │
│  ┌────────────────────────────────────────┐            │
│  │ PORT=5000                              │            │
│  │ NODE_ENV=development                   │            │
│  │ CLIENT_URL=http://localhost:5173       │            │
│  │                                        │            │
│  │ DB_USER=postgres                       │            │
│  │ DB_HOST=localhost                      │            │
│  │ DB_DATABASE=SkillLink                  │            │
│  │ DB_PASSWORD=1234                       │            │
│  │ DB_PORT=5432                           │            │
│  │                                        │            │
│  │ JWT_SECRET=your_secret_key             │            │
│  └────────────────────────────────────────┘            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

This architecture provides:
- ✅ Separation of concerns
- ✅ Secure authentication
- ✅ Scalable structure
- ✅ Clear data flow
- ✅ Type safety with PostgreSQL
- ✅ RESTful API design

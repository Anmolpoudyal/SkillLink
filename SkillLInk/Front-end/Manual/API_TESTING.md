# API Testing Guide

Test your SkillLink API endpoints using curl, Postman, or any API client.

## Base URL
```
http://localhost:5000/api/auth
```

## Important Notes
- All endpoints return JSON
- Authentication uses HTTP-only cookies
- Include credentials in requests

---

## 1. Customer Signup

**Endpoint:** `POST /api/auth/CustomerSignup`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+9779841234567",
  "password": "SecurePass123"
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/CustomerSignup \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"John Doe\",\"email\":\"john@example.com\",\"phone\":\"+9779841234567\",\"password\":\"SecurePass123\"}"
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

**Error Response (409):**
```json
{
  "message": "User already exists"
}
```

---

## 2. Provider Signup

**Endpoint:** `POST /api/auth/ProviderSignup`

**Request Body:**
```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+9779849876543",
  "password": "SecurePass123",
  "serviceCategory": "Electrician",
  "locations": ["Kathmandu", "Lalitpur"],
  "hourlyRate": 500,
  "experience": 5,
  "bio": "Experienced electrician with 5 years of expertise",
  "certificate": "base64_encoded_file_content_here"
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/ProviderSignup \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Jane Smith\",\"email\":\"jane@example.com\",\"phone\":\"+9779849876543\",\"password\":\"SecurePass123\",\"serviceCategory\":\"Electrician\",\"locations\":[\"Kathmandu\",\"Lalitpur\"],\"hourlyRate\":500,\"experience\":5,\"bio\":\"Experienced electrician\"}"
```

**Success Response (201):**
```json
{
  "message": "Provider registered successfully",
  "user": {
    "id": "uuid-here",
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "role": "service_provider"
  }
}
```

---

## 3. Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "customer"
}
```

**Note:** `role` is optional but recommended for validation

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d "{\"email\":\"john@example.com\",\"password\":\"SecurePass123\",\"role\":\"customer\"}"
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid email or password"
}
```

---

## 4. Get Current User (Protected)

**Endpoint:** `GET /api/auth/me`

**Headers:**
- Cookie: token=jwt_token_here

**cURL:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt
```

**Success Response (200):**
```json
{
  "id": "uuid-here",
  "full_name": "John Doe",
  "email": "john@example.com",
  "role": "customer"
}
```

**Error Response (401):**
```json
{
  "message": "Not authorized, no token"
}
```

---

## 5. Logout

**Endpoint:** `POST /api/auth/logout`

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt
```

**Success Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## Testing Workflow

### Complete Flow Test

1. **Register Customer**
```bash
curl -X POST http://localhost:5000/api/auth/CustomerSignup \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d "{\"fullName\":\"Test User\",\"email\":\"test@example.com\",\"phone\":\"+9779841111111\",\"password\":\"Test123\"}"
```

2. **Check Current User**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt
```

3. **Logout**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt
```

4. **Login Again**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123\",\"role\":\"customer\"}"
```

---

## Postman Collection

### Import to Postman

Create a new collection with these requests:

**Variables:**
- `base_url`: `http://localhost:5000`

**Requests:**

1. **Customer Signup**
   - Method: POST
   - URL: `{{base_url}}/api/auth/CustomerSignup`
   - Body: raw JSON (see above)

2. **Provider Signup**
   - Method: POST
   - URL: `{{base_url}}/api/auth/ProviderSignup`
   - Body: raw JSON (see above)

3. **Login**
   - Method: POST
   - URL: `{{base_url}}/api/auth/login`
   - Body: raw JSON (see above)
   - Tests: Save cookie automatically

4. **Get Me**
   - Method: GET
   - URL: `{{base_url}}/api/auth/me`
   - Authorization: Inherit from parent

5. **Logout**
   - Method: POST
   - URL: `{{base_url}}/api/auth/logout`

---

## Common Test Cases

### Test 1: Valid Customer Registration
✅ Status: 201
✅ Returns user object
✅ Sets authentication cookie

### Test 2: Duplicate Email
❌ Status: 409
❌ Message: "User already exists"

### Test 3: Missing Required Fields
❌ Status: 400
❌ Message: "All fields are required"

### Test 4: Valid Login
✅ Status: 200
✅ Returns user with role
✅ Sets authentication cookie

### Test 5: Invalid Password
❌ Status: 401
❌ Message: "Invalid email or password"

### Test 6: Role Mismatch
❌ Status: 401
❌ Message: "Invalid credentials for this role"

### Test 7: Protected Route Without Token
❌ Status: 401
❌ Message: "Not authorized, no token"

### Test 8: Provider Registration with Certificate
✅ Status: 201
✅ Creates user, provider profile, and locations
✅ Stores certificate in database

---

## Response Status Codes

- `200` - Success (Login, Get User, Logout)
- `201` - Created (Registration)
- `400` - Bad Request (Missing fields)
- `401` - Unauthorized (Invalid credentials, no token)
- `409` - Conflict (User already exists)
- `500` - Server Error

---

## Tips for Testing

1. **Use Cookie Management**
   - Postman: Enable cookie jar
   - cURL: Use `-c` to save cookies, `-b` to send cookies

2. **Check Response Headers**
   - Look for `Set-Cookie` header after login/signup

3. **Test Error Cases**
   - Try invalid data
   - Try missing fields
   - Try duplicate registrations

4. **Verify Database**
   - After each test, check PostgreSQL for data
   ```sql
   SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
   ```

5. **Clean Up Test Data**
   ```sql
   DELETE FROM users WHERE email LIKE '%test%';
   ```

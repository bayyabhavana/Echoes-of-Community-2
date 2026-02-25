# Echoes of Community - Automated Testing Guide

## Quick Start Commands

### 🚀 Start Everything Automatically

**Option 1: Using Batch Script (Recommended for Windows)**
```bash
.\start-and-test.bat
```
This will:
1. Start the authentication server in a new window
2. Start the frontend dev server in a new window
3. Wait for you to press a key
4. Run automated authentication tests

**Option 2: Using NPM Script**
```bash
npm run start:all
```
This opens both server and frontend in separate command windows.

---

## Individual Commands

### Start Server Only
```bash
npm run server
```

### Start Frontend Only
```bash
npm run dev
```

### Run Both Together (same terminal)
```bash
npm run dev:full
```

### Run Automated Tests
```bash
npm run test:auth
```

### Run Tests with Auto-Start Server
```bash
npm run test:auth:watch
```

---

## Automated Test Script

The automated test script (`server/test-auth.js`) tests:

1. ✅ **Login with Hashed Password** - Verifies bcrypt password comparison
2. ✅ **Invalid Login Rejection** - Ensures wrong passwords are rejected
3. ✅ **JWT Token Verification** - Validates token authentication
4. ✅ **Signup with Password Hashing** - Tests new user creation with hashing
5. ✅ **Password Reset** - Verifies password update with hashing

### Test Output Example:
```
═══════════════════════════════════════════════════════
🧪 AUTOMATED AUTHENTICATION SECURITY TESTS
═══════════════════════════════════════════════════════

🔐 Testing Login with Hashed Password...
✅ Login successful!
   User ID: 1
   Name: Initial Admin
   Email: admin@echoes.com
   Token received: eyJhbGciOiJIUzI1NiIs...

🚫 Testing Invalid Login (should fail)...
✅ Invalid login correctly rejected!
   Error message: Invalid email or password

🔍 Testing JWT Token Verification...
✅ Token verification successful!
   Verified user: Initial Admin (admin@echoes.com)

📝 Testing Signup with Password Hashing...
✅ Signup successful!
   User ID: 1738943234567
   Name: Automated Test User
   Email: test1738943234567@example.com
   Token received: eyJhbGciOiJIUzI1NiIs...

🔄 Testing Password Reset...
✅ Password reset successful!
   Message: Password reset successful

═══════════════════════════════════════════════════════
📊 TEST RESULTS SUMMARY
═══════════════════════════════════════════════════════
Total Tests: 5
Passed: 5
Failed: 0
Success Rate: 100.0%
═══════════════════════════════════════════════════════

🎉 All tests passed! Authentication system is working correctly.
```

---

## Manual Testing in Browser

1. **Start the servers:**
   ```bash
   npm run start:all
   ```

2. **Open browser to:** http://localhost:5173

3. **Test Login:**
   - Email: `admin@echoes.com`
   - Password: `password123`

4. **Test Signup:**
   - Create a new account with any credentials
   - Password will be automatically hashed

5. **Verify in DevTools:**
   - Press F12 → Application → Local Storage
   - Check for `echoes_user` and `echoes_token`

---

## Troubleshooting

### Server won't start
- Check if port 3001 is already in use
- Kill any existing Node processes: `taskkill /F /IM node.exe`

### Frontend won't start
- Check if port 5173 is already in use
- Try: `npm run dev -- --port 5174`

### Tests fail
- Ensure server is running on port 3001
- Check `server/data/users.json` exists
- Verify admin user password is hashed

---

## What's Automated

✅ **Server Startup** - Automatic via batch script or npm commands
✅ **Frontend Startup** - Automatic via batch script or npm commands  
✅ **Authentication Tests** - Fully automated API testing
✅ **Password Hashing** - Automatic on signup/reset
✅ **JWT Token Generation** - Automatic on login/signup
✅ **Token Storage** - Automatic in frontend
✅ **Session Persistence** - Automatic on page reload

---

## Next Steps

For production deployment, consider:
- Setting up CI/CD pipeline with these automated tests
- Adding more test cases for edge cases
- Implementing integration tests with Playwright/Cypress
- Adding performance testing for authentication endpoints

# Echoes of Community - Authentication System

## 🚀 Quick Start (Fully Automated)

**Double-click:** `start-automated.bat`

This will automatically:
- ✅ Install dependencies
- ✅ Hash passwords with bcrypt
- ✅ Start backend server (port 3001)
- ✅ Start frontend (port 5173)
- ✅ Run automated tests
- ✅ Open browser

**Login:** `admin@echoes.com` / `password123`

---

## Alternative Start Methods

### Quick Start (No Tests)
```bash
# Double-click: quick-start.bat
# Or run: npm run start:all
```

### Manual Start
```bash
# Terminal 1
npm run server

# Terminal 2
npm run dev
```

---

## Features

✅ **Secure Authentication**
- Bcrypt password hashing (10 salt rounds)
- JWT token authentication (7-day expiration)
- Protected routes with middleware
- Automatic session persistence

✅ **Fully Automated**
- One-click startup scripts
- Automated testing suite
- Automatic password migration
- Auto-open browser

✅ **Complete API**
- POST `/api/auth/signup` - Create account
- POST `/api/auth/login` - Login
- POST `/api/auth/reset-password` - Reset password
- GET `/api/auth/verify` - Verify token (protected)

---

## Testing

### Automated Tests
```bash
npm run test:auth
```

Tests verify:
- Login with hashed passwords
- Invalid login rejection
- JWT token generation
- Token verification
- Signup with hashing
- Password reset

---

## Project Structure

```
├── server/
│   ├── server.js              # Express server with security
│   ├── test-auth.js          # Automated test suite
│   ├── migrate-passwords.js   # Password hashing migration
│   └── data/users.json        # User database
├── src/
│   ├── hooks/useAuth.tsx      # Authentication hook
│   └── pages/LoginPage.tsx    # Login/signup UI
├── start-automated.bat        # Full automation script
├── quick-start.bat           # Quick start script
└── README-AUTOMATION.md      # Detailed automation guide
```

---

## Security

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for stateless auth
- ✅ Protected routes with middleware
- ✅ Secure password reset
- ✅ No plain-text password storage

---

## Documentation

- `README-AUTOMATION.md` - Complete automation guide
- `AUTOMATION.md` - Detailed automation documentation
- `walkthrough.md` - Implementation walkthrough

---

## Troubleshooting

**Port in use:**
```bash
npm run clean
```

**Dependencies missing:**
```bash
npm run setup
```

**Passwords not hashed:**
```bash
npm run migrate
```

---

## Development

Built with:
- React + TypeScript + Vite
- Express.js
- bcrypt + jsonwebtoken
- Tailwind CSS + shadcn/ui

---

For detailed automation instructions, see `README-AUTOMATION.md`

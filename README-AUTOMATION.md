# 🚀 One-Click Automation Guide

## Fastest Way to Start

### Method 1: Full Automation (Recommended)
**Double-click:** `start-automated.bat`

This automatically:
1. ✅ Checks Node.js installation
2. ✅ Installs dependencies (if needed)
3. ✅ Migrates passwords to hashed format
4. ✅ Starts authentication server
5. ✅ Starts frontend dev server
6. ✅ Runs automated tests
7. ✅ Opens browser to http://localhost:5173

**No manual steps required!**

---

### Method 2: Quick Start (No Tests)
**Double-click:** `quick-start.bat`

This automatically:
1. ✅ Starts both servers
2. ✅ Opens browser

---

### Method 3: NPM Commands

```bash
# Complete setup + start
npm run automate

# Just start servers
npm run start:all

# Setup only (install + migrate)
npm run setup

# Clean up (kill all Node processes)
npm run clean
```

---

## 📋 Available Batch Scripts

| File | What It Does | When to Use |
|------|--------------|-------------|
| `start-automated.bat` | **Full automation** - setup, start, test, open browser | First time or complete verification |
| `quick-start.bat` | **Quick start** - just start servers and open browser | Daily development |
| `start-and-test.bat` | Start servers, wait, then test | Manual testing |

---

## 🎯 Complete Automation Workflow

```
Double-click start-automated.bat
         ↓
   Check Node.js ✓
         ↓
   Install deps ✓
         ↓
   Hash passwords ✓
         ↓
   Start server ✓
         ↓
   Start frontend ✓
         ↓
   Run tests ✓
         ↓
   Open browser ✓
         ↓
   READY TO USE!
```

---

## 🔧 NPM Script Reference

### Setup & Maintenance
```bash
npm run setup      # Install dependencies + migrate passwords
npm run migrate    # Hash passwords in database
npm run clean      # Kill all Node processes
```

### Starting Servers
```bash
npm run server     # Backend only
npm run dev        # Frontend only
npm run dev:full   # Both in same terminal
npm run start:all  # Both in separate windows
```

### Testing
```bash
npm run test:auth         # Run authentication tests
npm run test:auth:watch   # Start server + run tests
npm run automate          # Full automation
```

---

## ✅ What's Automated

| Task | Automated? | How |
|------|-----------|-----|
| Install dependencies | ✅ Yes | `start-automated.bat` checks and installs |
| Hash passwords | ✅ Yes | Runs migration script automatically |
| Start backend | ✅ Yes | Opens in separate window |
| Start frontend | ✅ Yes | Opens in separate window |
| Run tests | ✅ Yes | Executes after servers start |
| Open browser | ✅ Yes | Opens to http://localhost:5173 |
| Password hashing on signup | ✅ Yes | Automatic in code |
| JWT token generation | ✅ Yes | Automatic in code |
| Token storage | ✅ Yes | Automatic in code |
| Session persistence | ✅ Yes | Automatic in code |

**Everything is automated!**

---

## 🎓 Usage Examples

### First Time Setup
```bash
# Just double-click:
start-automated.bat

# Or use npm:
npm run automate
```

### Daily Development
```bash
# Just double-click:
quick-start.bat

# Or use npm:
npm run start:all
```

### After Making Changes
```bash
# Kill old servers
npm run clean

# Restart everything
npm run start:all
```

### Run Tests Only
```bash
# Make sure server is running, then:
npm run test:auth
```

---

## 🌐 Default URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Test Endpoint:** http://localhost:3001/api/auth/verify

---

## 🔑 Login Credentials

**Email:** `admin@echoes.com`  
**Password:** `password123`

---

## 🐛 Troubleshooting

### "Port already in use"
```bash
npm run clean
# Then restart
```

### "Dependencies not installed"
```bash
npm run setup
```

### "Passwords not hashed"
```bash
npm run migrate
```

### "Tests failing"
```bash
# Make sure server is running first
npm run server
# Then in another terminal:
npm run test:auth
```

---

## 📊 What Happens When You Run start-automated.bat

```
Step 1: Check Node.js ..................... ✓
Step 2: Check dependencies ................ ✓
Step 3: Migrate passwords ................. ✓
Step 4: Start server (port 3001) .......... ✓
Step 5: Start frontend (port 5173) ........ ✓
Step 6: Run automated tests ............... ✓
        - Test login ...................... ✓
        - Test invalid login .............. ✓
        - Test token verification ......... ✓
        - Test signup ..................... ✓
        - Test password reset ............. ✓
Step 7: Open browser ...................... ✓

Result: 🎉 Everything ready to use!
```

---

## 🎯 Summary

**To start developing:**
1. Double-click `start-automated.bat` (first time)
2. Double-click `quick-start.bat` (daily use)

**That's it!** Everything else is automated.

No manual commands needed. No configuration required. Just click and code!

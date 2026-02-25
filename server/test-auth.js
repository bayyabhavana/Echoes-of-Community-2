import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSignup() {
    log('\n📝 Testing Signup with Password Hashing...', 'blue');
    try {
        const response = await fetch(`${API_BASE}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Automated Test User',
                email: `test${Date.now()}@example.com`,
                password: 'testpass123'
            })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            log('✅ Signup successful!', 'green');
            log(`   User ID: ${data.id}`, 'green');
            log(`   Name: ${data.name}`, 'green');
            log(`   Email: ${data.email}`, 'green');
            log(`   Token received: ${data.token.substring(0, 20)}...`, 'green');
            return { success: true, data };
        } else {
            log(`❌ Signup failed: ${data.message}`, 'red');
            return { success: false, error: data.message };
        }
    } catch (error) {
        log(`❌ Signup error: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

async function testLogin() {
    log('\n🔐 Testing Login with Hashed Password...', 'blue');
    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@echoes.com',
                password: 'password123'
            })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            log('✅ Login successful!', 'green');
            log(`   User ID: ${data.id}`, 'green');
            log(`   Name: ${data.name}`, 'green');
            log(`   Email: ${data.email}`, 'green');
            log(`   Token received: ${data.token.substring(0, 20)}...`, 'green');
            return { success: true, data };
        } else {
            log(`❌ Login failed: ${data.message}`, 'red');
            return { success: false, error: data.message };
        }
    } catch (error) {
        log(`❌ Login error: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

async function testInvalidLogin() {
    log('\n🚫 Testing Invalid Login (should fail)...', 'blue');
    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@echoes.com',
                password: 'wrongpassword'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            log('✅ Invalid login correctly rejected!', 'green');
            log(`   Error message: ${data.message}`, 'green');
            return { success: true };
        } else {
            log('❌ Security issue: Invalid password was accepted!', 'red');
            return { success: false };
        }
    } catch (error) {
        log(`❌ Test error: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

async function testTokenVerification(token) {
    log('\n🔍 Testing JWT Token Verification...', 'blue');
    try {
        const response = await fetch(`${API_BASE}/api/auth/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            log('✅ Token verification successful!', 'green');
            log(`   Verified user: ${data.name} (${data.email})`, 'green');
            return { success: true, data };
        } else {
            log(`❌ Token verification failed: ${data.message}`, 'red');
            return { success: false, error: data.message };
        }
    } catch (error) {
        log(`❌ Verification error: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

async function testPasswordReset() {
    log('\n🔄 Testing Password Reset...', 'blue');
    try {
        const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@echoes.com',
                newPassword: 'password123' // Reset to same password for testing
            })
        });

        const data = await response.json();

        if (response.ok) {
            log('✅ Password reset successful!', 'green');
            log(`   Message: ${data.message}`, 'green');
            return { success: true, data };
        } else {
            log(`❌ Password reset failed: ${data.message}`, 'red');
            return { success: false, error: data.message };
        }
    } catch (error) {
        log(`❌ Reset error: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

async function runTests() {
    log('═══════════════════════════════════════════════════════', 'yellow');
    log('🧪 AUTOMATED AUTHENTICATION SECURITY TESTS', 'yellow');
    log('═══════════════════════════════════════════════════════', 'yellow');

    const results = {
        total: 0,
        passed: 0,
        failed: 0
    };

    // Wait for server to be ready
    log('\n⏳ Waiting for server to be ready...', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 1: Login with existing hashed password
    results.total++;
    const loginResult = await testLogin();
    if (loginResult.success) results.passed++;
    else results.failed++;

    // Test 2: Invalid login attempt
    results.total++;
    const invalidLoginResult = await testInvalidLogin();
    if (invalidLoginResult.success) results.passed++;
    else results.failed++;

    // Test 3: Token verification (if login succeeded)
    if (loginResult.success && loginResult.data.token) {
        results.total++;
        const verifyResult = await testTokenVerification(loginResult.data.token);
        if (verifyResult.success) results.passed++;
        else results.failed++;
    }

    // Test 4: Signup with password hashing
    results.total++;
    const signupResult = await testSignup();
    if (signupResult.success) results.passed++;
    else results.failed++;

    // Test 5: Password reset
    results.total++;
    const resetResult = await testPasswordReset();
    if (resetResult.success) results.passed++;
    else results.failed++;

    // Summary
    log('\n═══════════════════════════════════════════════════════', 'yellow');
    log('📊 TEST RESULTS SUMMARY', 'yellow');
    log('═══════════════════════════════════════════════════════', 'yellow');
    log(`Total Tests: ${results.total}`, 'blue');
    log(`Passed: ${results.passed}`, 'green');
    log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
    log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`,
        results.failed === 0 ? 'green' : 'yellow');
    log('═══════════════════════════════════════════════════════\n', 'yellow');

    if (results.failed === 0) {
        log('🎉 All tests passed! Authentication system is working correctly.', 'green');
    } else {
        log('⚠️  Some tests failed. Please review the errors above.', 'red');
    }

    process.exit(results.failed === 0 ? 0 : 1);
}

runTests().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
});

const fetch = require('node-fetch'); // Ensure node-fetch is available or use global fetch in Node 18+

const baseUrl = 'http://127.0.0.1:3001';

async function test() {
    try {
        console.log('--- Starting Smoke Test ---');

        // 1. Health
        try {
            const health = await fetch(`${baseUrl}/health`).then(r => r.json());
            console.log('[PASS] Health Check:', health.status);
        } catch (e) {
            throw new Error(`Health check failed: ${e.message}. Is server running?`);
        }

        // 2. Register Super Admin
        const email = `qa_super_${Date.now()}@example.com`;
        const password = 'password123';
        console.log(`\n[INFO] Registering ${email}...`);

        const regRes = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email, password,
                firstName: 'QA', lastName: 'Master',
                role: 'SUPER_ADMIN'
            })
        });

        if (!regRes.ok) {
            const txt = await regRes.text();
            throw new Error(`Register failed: ${regRes.status} ${txt}`);
        }
        console.log('[PASS] Registered successfully.');

        // 3. Login
        console.log('\n[INFO] Logging in...');
        const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
        const { token } = await loginRes.json();
        if (!token) throw new Error('No token received');
        console.log('[PASS] Logged in. Token received.');

        // 4. Me Endpoint
        console.log('\n[INFO] Verifying /me...');
        const meRes = await fetch(`${baseUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!meRes.ok) throw new Error(`/me failed: ${meRes.status}`);
        const me = await meRes.json();
        console.log(`[PASS] Verified User: ${me.email} (${me.role})`);

        // 5. Users List (Protected)
        console.log('\n[INFO] Fetching Users List (Admin Only)...');
        const usersRes = await fetch(`${baseUrl}/api/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!usersRes.ok) throw new Error(`Users fetch failed: ${usersRes.status}`);
        const users = await usersRes.json();
        console.log(`[PASS] Users fetched. Total count: ${users.total}`);

        console.log('\n--- SMOKE TEST PASSED ---');
    } catch (e) {
        console.error('\n[FAIL] TEST FAILED:', e.message);
        process.exit(1);
    }
}

test();

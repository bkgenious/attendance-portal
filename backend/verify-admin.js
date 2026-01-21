const { buildApp } = require('./dist/app');

async function verifyAdminLogic() {
    console.log("Starting Super Admin Verification (Compiled Mode)...");
    const app = await buildApp();
    await app.ready();

    try {
        // 1. Login as Super Admin
        console.log("\n[1] Logging in as Super Admin...");
        const adminLogin = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { email: 'admin@portal.com', password: 'password123' }
        });

        if (adminLogin.statusCode !== 200) throw new Error("Admin Login Failed");
        const adminToken = JSON.parse(adminLogin.payload).token;
        console.log("✅ Admin Logged In");

        // 2. Fetch Users (Admin Only)
        console.log("\n[2] Fetching All Users (Admin Action)...");
        const usersRes = await app.inject({
            method: 'GET',
            url: '/api/users',
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        if (usersRes.statusCode !== 200) {
            console.error("❌ Failed to fetch users:", usersRes.payload);
            throw new Error("Admin cannot fetch users");
        }
        console.log("✅ Users fetched successfully. Count:", JSON.parse(usersRes.payload).data.length);

        // 3. Login as Employee (Negative Test)
        console.log("\n[3] Logging in as Employee...");
        const empLogin = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { email: 'employee@portal.com', password: 'password123' }
        });
        const empToken = JSON.parse(empLogin.payload).token;

        // 4. Employee try fetch users (Should Fail)
        console.log("\n[4] Employee attempting to fetch users (Should Fail)...");
        const failUsers = await app.inject({
            method: 'GET',
            url: '/api/users',
            headers: { Authorization: `Bearer ${empToken}` }
        });

        if (failUsers.statusCode === 403) {
            console.log("✅ Correctly rejected (403 Forbidden)");
        } else {
            console.error("❌ Employee WAS ABLE to fetch users! Status:", failUsers.statusCode);
            throw new Error("Security Breach: Employee can fetch users");
        }

        console.log("\nSUCCESS: Backend Logic Verified!");
    } catch (err) {
        console.error("\nFAILED:", err);
        process.exit(1);
    } finally {
        await app.close();
    }
}

verifyAdminLogic();

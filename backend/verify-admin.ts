import { PrismaClient } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import { buildApp } from './src/app';

// Mock request/reply for internal injection or use fetch locally?
// Better to use `app.inject()` from fastify for pure backend logic testing without network overhead.

async function verifyAdminLogic() {
    console.log("Starting Super Admin Verification...");
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

        if (adminLogin.statusCode !== 200) throw new Error("Admin Login Failed: " + adminLogin.payload);
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

        // 3. Update User Role (Admin Only) - Let's verify we can find the EMPLOYEE and try to update them
        const users = JSON.parse(usersRes.payload).data;
        const employee = users.find((u: any) => u.email === 'employee@portal.com');

        if (employee) {
            console.log("\n[3] Updating Employee Role (Admin Action)...");
            const updateRes = await app.inject({
                method: 'PATCH',
                url: `/api/users/${employee.id}`,
                headers: { Authorization: `Bearer ${adminToken}` },
                payload: { isActive: true } // Just touching isActive to verify permission
            });
            if (updateRes.statusCode !== 200) {
                console.error("❌ Failed to update user:", updateRes.payload);
                throw new Error("Admin cannot update user");
            }
            console.log("✅ User updated successfully");
        }

        // 4. Fetch Audit Logs (Admin Only)
        console.log("\n[4] Fetching Audit Logs...");
        const auditRes = await app.inject({
            method: 'GET',
            url: '/api/audit',
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        if (auditRes.statusCode !== 200) {
            console.error("❌ Failed to fetch audit logs:", auditRes.payload);
            throw new Error("Admin cannot fetch audit logs");
        }
        console.log("✅ Audit logs fetched");

        // 5. Login as Employee (Negative Test)
        console.log("\n[5] Logging in as Employee...");
        const empLogin = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { email: 'employee@portal.com', password: 'password123' }
        });
        const empToken = JSON.parse(empLogin.payload).token;

        // 6. Employee try fetch users (Should Fail)
        console.log("\n[6] Employee attempting to fetch users (Should Fail)...");
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

        console.log("\nSUCCESS: All Backend Logics & Admin Privileges are Working Correctly!");
    } catch (err) {
        console.error("\nFAILED:", err);
        process.exit(1);
    } finally {
        await app.close();
    }
}

verifyAdminLogic();

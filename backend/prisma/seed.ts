import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('password123', 10);

    // Super Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@portal.com' },
        update: { password },
        create: {
            email: 'admin@portal.com',
            password,
            role: Role.SUPER_ADMIN,
            employeeProfile: {
                create: {
                    firstName: 'Super',
                    lastName: 'Admin',
                    employeeId: 'EMP-001'
                }
            }
        },
    });

    // CEO
    const ceo = await prisma.user.upsert({
        where: { email: 'ceo@portal.com' },
        update: { password },
        create: {
            email: 'ceo@portal.com',
            password,
            role: Role.CEO,
            employeeProfile: {
                create: {
                    firstName: 'Chief',
                    lastName: 'Executive',
                    employeeId: 'EMP-000',
                    department: 'Executive'
                }
            }
        },
    });

    // HR
    const hr = await prisma.user.upsert({
        where: { email: 'hr@portal.com' },
        update: { password },
        create: {
            email: 'hr@portal.com',
            password,
            role: Role.HR,
            employeeProfile: {
                create: {
                    firstName: 'Human',
                    lastName: 'Resource',
                    employeeId: 'EMP-002',
                    department: 'HR'
                }
            }
        },
    });

    // Employee
    const employee = await prisma.user.upsert({
        where: { email: 'employee@portal.com' },
        update: { password },
        create: {
            email: 'employee@portal.com',
            password,
            role: Role.EMPLOYEE,
            employeeProfile: {
                create: {
                    firstName: 'John',
                    lastName: 'Doe',
                    employeeId: 'EMP-003',
                    department: 'Engineering'
                }
            }
        },
    });

    console.log({ admin, hr, employee });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

import { PrismaClient, Payslip } from '@prisma/client';

export class PayrollService {
    constructor(private prisma: PrismaClient) { }

    async generatePayslip(userId: string, month: number, year: number, generatorId: string): Promise<Payslip> {
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 0)); // Last day of month

        // Get User Profile
        const profile = await this.prisma.employeeProfile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new Error('Employee profile not found');
        }

        // Get Attendance
        const attendances = await this.prisma.attendance.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: { breaks: true },
        });

        // Get Leaves
        const leaves = await this.prisma.leaveRequest.findMany({
            where: {
                userId,
                status: 'APPROVED',
                startDate: { gte: startDate }, // Simplified overlap check
                endDate: { lte: endDate },     // In real world, intersection logic needed
            },
        });

        // Calculation Logic (Simplified)
        let presentDays = 0;
        attendances.forEach(att => {
            if (att.status === 'PRESENT') presentDays += 1;
            else if (att.status === 'HALF_DAY') presentDays += 0.5;
            else if (att.status === 'LATE') presentDays += 1; // Late might have deduction? Assuming full day for now.
        });

        // Count Leave Days
        let leaveDays = 0;
        leaves.forEach(leave => {
            // Ideally calculate days between start/end intersecting with month
            // Simplified: 1 day per leave record for now? No, need duration.
            const days = (leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 3600 * 24) + 1;
            leaveDays += days;
        });

        const totalDays = endDate.getDate();
        const workingDays = presentDays + leaveDays; // Simplified
        const absentDays = totalDays - workingDays; // Rough estimate (including weekends)

        // Salary Calc
        const monthlySalary = profile.baseSalary;
        const perDaySalary = monthlySalary / 30; // Standard 30 days?

        const deductionAmount = absentDays * perDaySalary;
        const netPay = Math.max(0, monthlySalary - deductionAmount);

        // Upsert Payslip
        return this.prisma.payslip.upsert({
            where: {
                userId_month_year: {
                    userId,
                    month,
                    year,
                }
            },
            update: {
                presentDays,
                leaveDays,
                absentDays,
                salary: monthlySalary,
                deductions: deductionAmount,
                netPay,
                generatedAt: new Date(),
                generatedBy: generatorId,
            },
            create: {
                userId,
                month,
                year,
                totalDays,
                presentDays,
                leaveDays,
                absentDays,
                salary: monthlySalary,
                deductions: deductionAmount,
                netPay,
                generatedBy: generatorId,
            },
        });
    }

    async getPayslip(userId: string, month: number, year: number): Promise<Payslip | null> {
        return this.prisma.payslip.findUnique({
            where: {
                userId_month_year: {
                    userId,
                    month,
                    year,
                },
            },
        });
    }
}

import { PrismaClient, Role } from '@prisma/client';
import { TimeService } from '../../services/TimeService';
import * as bcrypt from 'bcrypt';

export class AdminService {
    constructor(private prisma: PrismaClient) { }

    /**
     * Create a new user (Admin/CEO function)
     * Auto-activates the user for immediate access.
     */
    async createUser(data: any) {
        const { email, password, firstName, lastName, role, department, employeeId } = data;

        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new Error('User already exists');

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role || 'EMPLOYEE',
                isActive: true, // Immediate access
                employeeProfile: {
                    create: {
                        firstName,
                        lastName,
                        employeeId: employeeId || `EMP-${Date.now()}`,
                        department: department || 'Unassigned'
                    }
                }
            },
            include: { employeeProfile: true }
        });

        return user;
    }

    /**
     * Get real-time company stats for executive dashboard.
     * Returns: presentToday, lateToday, onLeave, totalEmployees
     */
    async getCompanyStats() {
        const today = TimeService.startOfToday();

        // Total employees (active users with EMPLOYEE role or any role that's not system)
        const totalEmployees = await this.prisma.user.count({
            where: {
                role: {
                    notIn: ['SUPER_ADMIN', 'SYSTEM_ADMIN'] // Exclude system accounts from employee count
                }
            }
        });

        // Present Today (checked in today)
        const presentToday = await this.prisma.attendance.count({
            where: {
                date: today,
                status: 'PRESENT'
            }
        });

        // On Leave Today (approved leaves that cover today)
        const onLeave = await this.prisma.leaveRequest.count({
            where: {
                status: 'APPROVED',
                startDate: { lte: today },
                endDate: { gte: today }
            }
        });

        // Late Today (check-in after 9:30 AM IST — configurable threshold)
        // For simplicity, we'll count records where checkIn time is after 9:30 AM
        const lateThreshold = new Date(today);
        lateThreshold.setHours(9, 30, 0, 0); // 9:30 AM

        const lateToday = await this.prisma.attendance.count({
            where: {
                date: today,
                checkIn: {
                    gt: lateThreshold
                }
            }
        });

        // Absent Today (not checked in and not on leave)
        const absentToday = totalEmployees - presentToday - onLeave;

        return {
            presentToday,
            lateToday,
            onLeave,
            absentToday: Math.max(0, absentToday), // Ensure non-negative
            totalEmployees
        };
    }

    /**
     * Get attendance trends for the past N days
     */
    async getAttendanceTrends(days: number = 7) {
        const trends = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const count = await this.prisma.attendance.count({
                where: {
                    date: date,
                    status: 'PRESENT'
                }
            });

            trends.push({
                date: date.toISOString().split('T')[0],
                present: count
            });
        }

        return trends;
    }

    /**
     * Get attendance breakdown by department
     */
    async getDepartmentStats() {
        const today = TimeService.startOfToday();

        // Get all departments with employee counts
        const departments = await this.prisma.employeeProfile.groupBy({
            by: ['department'],
            _count: { id: true }
        });

        const stats = await Promise.all(
            departments.map(async (dept) => {
                const deptName = dept.department || 'Unassigned';

                // Get user IDs in this department
                const usersInDept = await this.prisma.employeeProfile.findMany({
                    where: { department: dept.department },
                    select: { userId: true }
                });
                const userIds = usersInDept.map(u => u.userId);

                // Count present today
                const presentCount = await this.prisma.attendance.count({
                    where: {
                        date: today,
                        userId: { in: userIds },
                        status: 'PRESENT'
                    }
                });

                const totalInDept = dept._count.id;
                const attendanceRate = totalInDept > 0
                    ? Math.round((presentCount / totalInDept) * 100)
                    : 0;

                return {
                    department: deptName,
                    total: totalInDept,
                    present: presentCount,
                    attendanceRate
                };
            })
        );

        // Sort by attendance rate descending
        return stats.sort((a, b) => b.attendanceRate - a.attendanceRate);
    }

    /**
     * Get pending leave approvals count and list
     */
    async getPendingApprovals(limit: number = 10) {
        const pendingCount = await this.prisma.leaveRequest.count({
            where: { status: 'PENDING' }
        });

        const pendingRequests = await this.prisma.leaveRequest.findMany({
            where: { status: 'PENDING' },
            include: {
                user: {
                    select: {
                        email: true,
                        employeeProfile: {
                            select: {
                                firstName: true,
                                lastName: true,
                                department: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'asc' },
            take: limit
        });

        return {
            count: pendingCount,
            requests: pendingRequests
        };
    }

    /**
     * Get alerts for unusual patterns
     */
    async getAlerts() {
        const today = TimeService.startOfToday();
        const alerts = [];

        // Alert 1: Employees absent 3+ consecutive days
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        // Get users who haven't checked in for 3+ days (simplified)
        const recentAttendance = await this.prisma.attendance.findMany({
            where: {
                date: { gte: threeDaysAgo },
                status: 'PRESENT'
            },
            select: { userId: true }
        });
        const activeUserIds = new Set(recentAttendance.map(a => a.userId));

        const allEmployees = await this.prisma.user.findMany({
            where: {
                role: { notIn: ['SUPER_ADMIN', 'SYSTEM_ADMIN'] },
                isActive: true
            },
            include: {
                employeeProfile: {
                    select: { firstName: true, lastName: true }
                }
            }
        });

        const absentUsers = allEmployees.filter(u => !activeUserIds.has(u.id));

        if (absentUsers.length > 0) {
            alerts.push({
                type: 'warning',
                title: 'Extended Absences',
                message: `${absentUsers.length} employee(s) have not checked in for 3+ days`,
                count: absentUsers.length
            });
        }

        // Alert 2: High pending approvals
        const pendingCount = await this.prisma.leaveRequest.count({
            where: { status: 'PENDING' }
        });

        if (pendingCount > 5) {
            alerts.push({
                type: 'info',
                title: 'Pending Approvals',
                message: `${pendingCount} leave requests awaiting approval`,
                count: pendingCount
            });
        }

        return alerts;
    }

    /**
     * Get recent activity for a specific user
     */
    async getUserActivity(userId: string, limit: number = 20) {
        return this.prisma.auditLog.findMany({
            where: {
                userId,
                action: { in: ['LOGIN', 'LOGOUT'] }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }

    /**
     * Get pending password reset requests
     */
    async getPendingPasswordRequests() {
        const requests = await (this.prisma as any).passwordResetRequest.findMany({
            where: { status: 'PENDING' },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                        employeeProfile: {
                            select: {
                                firstName: true,
                                lastName: true,
                                department: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
        return requests;
    }

    /**
     * Approve a password reset request
     */
    async approvePasswordRequest(requestId: string, adminId: string) {
        const request = await (this.prisma as any).passwordResetRequest.findUnique({
            where: { id: requestId }
        });

        if (!request || request.status !== 'PENDING') {
            throw new Error('Request not found or already processed');
        }

        // Update User password and Request status in transaction
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: request.userId },
                data: { password: request.newPasswordHash }
            }),
            (this.prisma as any).passwordResetRequest.update({
                where: { id: requestId },
                data: {
                    status: 'APPROVED',
                    approvedBy: adminId
                }
            }),
            // Log audit
            this.prisma.auditLog.create({
                data: {
                    action: 'UPDATE',
                    resource: 'User',
                    resourceId: request.userId,
                    userId: adminId,
                    details: { message: 'Password reset approved via request', requestId }
                }
            })
        ]);

        return { message: 'Password updated successfully' };
    }

    /**
     * Reject a password reset request
     */
    async rejectPasswordRequest(requestId: string, adminId: string) {
        await (this.prisma as any).passwordResetRequest.update({
            where: { id: requestId },
            data: {
                status: 'REJECTED',
                approvedBy: adminId // Recorded as the one who decided
            }
        });
        return { message: 'Request rejected' };
    }

    /**
     * DANGER: Reset all system data (Attendance, Leaves, etc.)
     * Use with extreme caution.
     */
    async resetSystemData(adminId: string) {
        // Transaction to ensure all or nothing
        await this.prisma.$transaction([
            this.prisma.break.deleteMany(),
            this.prisma.attendance.deleteMany(),
            this.prisma.leaveRequest.deleteMany(),
            (this.prisma as any).passwordResetRequest.deleteMany(),
            // We can optionally clear audit logs or keep them to track who did this
            this.prisma.auditLog.create({
                data: {
                    action: 'DELETE',
                    resource: 'System',
                    resourceId: 'ALL',
                    userId: adminId,
                    details: { message: 'SYSTEM RESET PERFORMED. All attendance and leave data wiped.' }
                }
            })
        ]);

        return { message: 'System data reset successfully' };
    }
}

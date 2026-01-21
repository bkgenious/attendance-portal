import { PrismaClient, Attendance } from '@prisma/client';
import { TimeService } from '../../services/TimeService';
import { CheckInInput, CheckOutInput } from './attendance.schema';

export class AttendanceService {
    constructor(private prisma: PrismaClient) { }

    async checkIn(userId: string, data: CheckInInput): Promise<Attendance> {
        const today = TimeService.startOfToday();

        // Check if already checked in
        const existing = await this.prisma.attendance.findUnique({
            where: {
                userId_date: { // Compound unique key
                    userId,
                    date: today,
                },
            },
        });

        if (existing) {
            throw new Error('Already checked in for today');
        }

        // Create Attendance Record
        return this.prisma.attendance.create({
            data: {
                userId,
                date: today,
                checkIn: TimeService.now(),
                status: 'PRESENT',
                // We could store notes/location in a separate JSON field or notes column if we added it.
                // For now, schema doesn't have notes/location. We'll ignore them or add them if schema updated.
                // Assuming strict schema adherence, we ignore extra fields primarily.
            },
        });
    }

    async checkOut(userId: string, data: CheckOutInput): Promise<Attendance> {
        const today = TimeService.startOfToday();

        // Find record
        const existing = await this.prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: today,
                },
            },
        });

        if (!existing) {
            throw new Error('No check-in record found for today');
        }

        if (existing.checkOut) {
            throw new Error('Already checked out for today');
        }

        // Update with Check Out Time
        return this.prisma.attendance.update({
            where: { id: existing.id },
            data: {
                checkOut: TimeService.now(),
            },
        });
    }

    async getTodayStatus(userId: string): Promise<Attendance | null> {
        return this.prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: TimeService.startOfToday(),
                },
            },
        });
    }

    async getHistory(userId: string, limit = 30): Promise<Attendance[]> {
        return this.prisma.attendance.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: limit,
        });
    }

    async getMonthlyReport(month: number, year: number) {
        // Calculate start and end dates ensuring UTC consistency
        // Note: Months are 0-indexed in JS Date, but we'll accept 1-12 from API transparently or 0-11.
        // Let's standardise on accepting 1-12 from API.
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 0)); // Last day of month

        return this.prisma.attendance.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                user: {
                    select: {
                        email: true,
                        employeeProfile: {
                            select: {
                                firstName: true,
                                lastName: true,
                                department: true,
                                designation: true,
                                employeeId: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                date: 'asc' // Chronological order
            }
        });
    }

    async getUserMonthlyReport(userId: string, month: number, year: number) {
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 0));

        return this.prisma.attendance.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: {
                date: 'asc'
            }
        });
    }

    async overrideAttendance(
        adminId: string,
        targetUserId: string,
        date: string | Date,
        data: { status: any; checkIn?: string; checkOut?: string }
    ) {
        const targetDate = new Date(date);
        targetDate.setUTCHours(0, 0, 0, 0); // Normalize to midnight UTC for date column

        // Ensure status is valid enum
        const status = data.status;

        // Parse times if provided
        const checkIn = data.checkIn ? new Date(data.checkIn) : null;
        const checkOut = data.checkOut ? new Date(data.checkOut) : null;

        // Upsert: Update if exists, Create if not
        const result = await this.prisma.attendance.upsert({
            where: {
                userId_date: {
                    userId: targetUserId,
                    date: targetDate
                }
            },
            update: {
                status,
                checkIn,
                checkOut,
                isFinalized: true // Admin override finalizes it
            },
            create: {
                userId: targetUserId,
                date: targetDate,
                status,
                checkIn,
                checkOut,
                isFinalized: true
            }
        });

        // Audit Log
        await this.prisma.auditLog.create({
            data: {
                userId: adminId,
                action: 'OVERRIDE',
                resource: 'Attendance',
                resourceId: result.id,
                details: {
                    targetUserId,
                    date: targetDate,
                    ...data
                }
            }
        });

        return result;
    }

    /**
     * Get all active users and their attendance for a specific date
     */
    async getDailyAttendance(date: string) {
        const targetDate = new Date(date);
        targetDate.setUTCHours(0, 0, 0, 0);

        // Fetch all active users
        const users = await this.prisma.user.findMany({
            where: { isActive: true },
            select: {
                id: true,
                email: true,
                employeeProfile: {
                    select: {
                        firstName: true,
                        lastName: true,
                        department: true,
                        designation: true,
                        employeeId: true,
                        address: true // Optional, but good for context
                    }
                }
            },
            orderBy: {
                employeeProfile: {
                    firstName: 'asc'
                }
            }
        });

        // Fetch all attendance records for this date
        const attendanceRecords = await this.prisma.attendance.findMany({
            where: {
                date: targetDate
            }
        });

        // Merge Data
        return users.map(user => {
            const record = attendanceRecords.find(r => r.userId === user.id);
            return {
                user,
                attendance: record || null
            };
        });
    }

    /**
     * Bulk update attendance records
     */
    async bulkUpdateAttendance(
        adminId: string,
        date: string,
        updates: { userId: string; status: any }[]
    ) {
        const targetDate = new Date(date);
        targetDate.setUTCHours(0, 0, 0, 0);

        const results = [];

        // Using sequential processing to avoid connection pool exhaustion if too many
        // For < 1000 users, Promise.all is fine.
        for (const update of updates) {
            try {
                const res = await this.prisma.attendance.upsert({
                    where: {
                        userId_date: {
                            userId: update.userId,
                            date: targetDate
                        }
                    },
                    update: {
                        status: update.status,
                        isFinalized: true
                    },
                    create: {
                        userId: update.userId,
                        date: targetDate, // Fixed: Use targetDate instance
                        status: update.status,
                        isFinalized: true
                    }
                });
                results.push({ userId: update.userId, success: true, id: res.id });
            } catch (e) {
                console.error(`Failed to update ${update.userId}`, e);
                results.push({ userId: update.userId, success: false });
            }
        }

        // Consolidated Audit Log
        if (updates.length > 0) {
            await this.prisma.auditLog.create({
                data: {
                    userId: adminId,
                    action: 'UPDATE', // Using UPDATE generically for bulk
                    resource: 'Attendance',
                    details: {
                        operation: 'BULK_UPDATE',
                        date: targetDate,
                        count: updates.length,
                        firstId: updates[0].userId
                    }
                }
            });
        }

        return results;
    }
}

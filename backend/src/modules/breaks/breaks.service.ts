import { PrismaClient, Break } from '@prisma/client';
import { TimeService } from '../../services/TimeService';
import { differenceInMinutes } from 'date-fns';

export class BreakService {
    constructor(private prisma: PrismaClient) { }

    async startBreak(userId: string): Promise<Break> {
        const today = TimeService.startOfToday();

        // Get Attendance
        const attendance = await this.prisma.attendance.findUnique({
            where: { userId_date: { userId, date: today } }
        });

        if (!attendance) {
            throw new Error('Must check in before taking a break');
        }

        if (attendance.checkOut) {
            throw new Error('Already checked out for the day');
        }

        // Check for open breaks
        const openBreak = await this.prisma.break.findFirst({
            where: {
                attendanceId: attendance.id,
                endTime: null,
            },
        });

        if (openBreak) {
            throw new Error('Already on a break');
        }

        return this.prisma.break.create({
            data: {
                attendanceId: attendance.id,
                startTime: TimeService.now(),
            },
        });
    }

    async endBreak(userId: string): Promise<Break> {
        const today = TimeService.startOfToday();
        const attendance = await this.prisma.attendance.findUnique({
            where: { userId_date: { userId, date: today } }
        });

        if (!attendance) {
            throw new Error('Attendance record not found');
        }

        // Find open break
        const openBreak = await this.prisma.break.findFirst({
            where: {
                attendanceId: attendance.id,
                endTime: null,
            },
        });

        if (!openBreak) {
            throw new Error('No open break found');
        }

        const now = TimeService.now();
        const duration = differenceInMinutes(now, openBreak.startTime);

        return this.prisma.break.update({
            where: { id: openBreak.id },
            data: {
                endTime: now,
                durationMins: duration,
            },
        });
    }

    async getTodayBreaks(userId: string): Promise<Break[]> {
        const today = TimeService.startOfToday();
        const attendance = await this.prisma.attendance.findUnique({
            where: { userId_date: { userId, date: today } }
        });

        if (!attendance) {
            return [];
        }

        return this.prisma.break.findMany({
            where: { attendanceId: attendance.id },
            orderBy: { startTime: 'asc' },
        });
    }
}

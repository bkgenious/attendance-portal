import { PrismaClient, LeaveRequest, LeaveStatus } from '@prisma/client';
import { TimeService } from '../../services/TimeService';
import { RequestLeaveInput, ApproveLeaveInput } from './leaves.schema';

export class LeaveService {
    constructor(private prisma: PrismaClient) { }

    async requestLeave(userId: string, data: RequestLeaveInput): Promise<LeaveRequest> {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);

        if (start > end) {
            throw new Error('Start date cannot be after end date');
        }

        if (start < TimeService.startOfToday()) {
            // Allowing retroactive leaves? Requirements didn't specify.
            // Usually leave requests are for future or today.
            // Let's allow today, but maybe warn for past?
            // Strict fraud-proof might say "No retroactive without Admin", but for now allow it.
        }

        // Check overlap
        const existing = await this.prisma.leaveRequest.findFirst({
            where: {
                userId,
                status: { in: ['PENDING', 'APPROVED'] },
                OR: [
                    {
                        startDate: { lte: end },
                        endDate: { gte: start },
                    },
                ],
            },
        });

        if (existing) {
            throw new Error('Leave request overlaps with an existing request');
        }

        return this.prisma.leaveRequest.create({
            data: {
                userId,
                startDate: start,
                endDate: end,
                reason: data.reason,
                status: 'PENDING',
            },
        });
    }

    async approveLeave(requestId: string, approverId: string, data: ApproveLeaveInput): Promise<LeaveRequest> {
        const leave = await this.prisma.leaveRequest.findUnique({
            where: { id: requestId },
        });

        if (!leave) {
            throw new Error('Leave request not found');
        }

        if (leave.status !== 'PENDING') {
            throw new Error('Leave request is not pending');
        }

        // Update status
        return this.prisma.leaveRequest.update({
            where: { id: requestId },
            data: {
                status: data.status as LeaveStatus,
                approvedBy: approverId,
                rejectionReason: data.status === 'REJECTED' ? data.rejectionReason : null,
            },
        });
    }

    async getMyLeaves(userId: string): Promise<LeaveRequest[]> {
        return this.prisma.leaveRequest.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getPendingLeaves(): Promise<LeaveRequest[]> {
        return this.prisma.leaveRequest.findMany({
            where: { status: 'PENDING' },
            include: { user: { include: { employeeProfile: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }
}

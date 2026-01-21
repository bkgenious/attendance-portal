import { PrismaClient, AuditLog, AuditAction } from '@prisma/client';
import { GetAuditLogsInput } from './audit.schema';

export class AuditService {
    constructor(private prisma: PrismaClient) { }

    async log(action: AuditAction, resource: string, resourceId: string | null, userId: string | null, details: any = null, ipAddress?: string, userAgent?: string): Promise<AuditLog> {
        return this.prisma.auditLog.create({
            data: {
                action,
                resource,
                resourceId,
                userId,
                details: details ? (details as any) : undefined, // Cast for Json
                ipAddress,
                userAgent,
            },
        });
    }

    async getLogs(filter: GetAuditLogsInput): Promise<{ data: AuditLog[]; total: number }> {
        const { page, limit, userId, action, resource, startDate, endDate } = filter;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (userId) where.userId = userId;
        if (action) where.action = action;
        if (resource) where.resource = resource;

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const [total, data] = await Promise.all([
            this.prisma.auditLog.count({ where }),
            this.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { email: true, role: true } } },
            }),
        ]);

        return { data, total };
    }
}

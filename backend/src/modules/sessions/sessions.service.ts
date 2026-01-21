import { PrismaClient, Session } from '@prisma/client';

export class SessionService {
    constructor(private prisma: PrismaClient) { }

    async getAllActive(): Promise<(Session & { user: { email: string, role: string, employeeProfile: { firstName: string, lastName: string } | null } })[]> {
        return this.prisma.session.findMany({
            where: {
                isValid: true,
                expiresAt: {
                    gt: new Date()
                }
            },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                        employeeProfile: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            },
            orderBy: { lastActive: 'desc' }
        });
    }

    async revoke(id: string): Promise<Session> {
        return this.prisma.session.update({
            where: { id },
            data: { isValid: false }
        });
    }

    async revokeAllForUser(userId: string): Promise<any> {
        return this.prisma.session.updateMany({
            where: { userId, isValid: true },
            data: { isValid: false }
        });
    }
}

import { FastifyInstance } from 'fastify';
import { SessionService } from './sessions.service';
import { Role } from '@prisma/client';
import { hasRole } from '../rbac/rbac.middleware';
import { z } from 'zod';

export async function sessionRoutes(app: FastifyInstance) {
    const service = new SessionService(app.prisma);

    app.addHook('onRequest', app.authenticate);

    // List all active sessions (Admin only)
    app.get(
        '/',
        {
            preHandler: [hasRole([Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.CEO])],
            schema: {
                tags: ['Sessions'],
                response: {
                    200: z.array(z.object({
                        id: z.string(),
                        userId: z.string(),
                        ipAddress: z.string().nullable(),
                        userAgent: z.string().nullable(),
                        lastActive: z.date(), // Fastify serialization handles Date to string
                        user: z.object({
                            email: z.string(),
                            role: z.string(),
                            employeeProfile: z.object({
                                firstName: z.string(),
                                lastName: z.string(),
                            }).nullable()
                        })
                    }))
                }
            }
        },
        async (request, reply) => {
            const sessions = await service.getAllActive();
            return reply.send(sessions);
        }
    );

    // Revoke specific session
    app.post(
        '/:id/revoke',
        {
            preHandler: [hasRole([Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.CEO])],
            schema: {
                tags: ['Sessions'],
                params: z.object({ id: z.string() })
            }
        },
        async (request, reply) => {
            const { id } = request.params as any;
            await service.revoke(id);
            return reply.send({ message: 'Session revoked' });
        }
    );

    // Revoke all sessions for a user
    app.post(
        '/user/:userId/revoke',
        {
            preHandler: [hasRole([Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.CEO])],
            schema: {
                tags: ['Sessions'],
                params: z.object({ userId: z.string() })
            }
        },
        async (request, reply) => {
            const { userId } = request.params as any;
            await service.revokeAllForUser(userId);
            return reply.send({ message: 'All sessions revoked for user' });
        }
    );
}

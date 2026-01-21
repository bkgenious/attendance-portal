import { FastifyInstance } from 'fastify';
import { AdminService } from './admin.service';
import { Role } from '@prisma/client';

export async function adminRoutes(app: FastifyInstance) {
    const service = new AdminService(app.prisma);

    // Protect all routes - require authentication
    app.addHook('onRequest', app.authenticate);

    // Role check for Super Admin / CEO only
    const requireExecutive = async (request: any, reply: any) => {
        const user = request.user as any;
        if (!['SUPER_ADMIN', 'SYSTEM_ADMIN', 'CEO'].includes(user.role)) {
            return reply.code(403).send({ message: 'Executive access required' });
        }
    };

    // Role check for Security (Admin + CEO + HR)
    const requireSecurityAccess = async (request: any, reply: any) => {
        const user = request.user as any;
        if (!['SUPER_ADMIN', 'SYSTEM_ADMIN', 'CEO', 'HR'].includes(user.role)) {
            return reply.code(403).send({ message: 'Security access required' });
        }
    };

    // GET /api/admin/stats — Real-time company stats
    app.get(
        '/stats',
        {
            schema: {
                tags: ['Admin'],
                summary: 'Get real-time company attendance stats',
            },
            preHandler: requireSecurityAccess
        },
        async (request, reply) => {
            const stats = await service.getCompanyStats();
            return reply.send(stats);
        }
    );

    // GET /api/admin/trends — Attendance trends for past 7 days
    app.get<{ Querystring: { days?: number } }>(
        '/trends',
        {
            schema: {
                tags: ['Admin'],
                summary: 'Get attendance trends',
                querystring: {
                    type: 'object',
                    properties: {
                        days: { type: 'integer', default: 7, minimum: 1, maximum: 30 }
                    }
                }
            },
            preHandler: requireSecurityAccess
        },
        async (request, reply) => {
            const days = request.query.days || 7;
            const trends = await service.getAttendanceTrends(days);
            return reply.send(trends);
        }
    );

    // GET /api/admin/departments — Department attendance breakdown
    app.get(
        '/departments',
        {
            schema: {
                tags: ['Admin'],
                summary: 'Get attendance breakdown by department',
            },
            preHandler: requireSecurityAccess
        },
        async (request, reply) => {
            const stats = await service.getDepartmentStats();
            return reply.send(stats);
        }
    );

    // GET /api/admin/pending-approvals — Pending leave requests
    app.get<{ Querystring: { limit?: number } }>(
        '/pending-approvals',
        {
            schema: {
                tags: ['Admin'],
                summary: 'Get pending leave approval requests',
                querystring: {
                    type: 'object',
                    properties: {
                        limit: { type: 'integer', default: 10, minimum: 1, maximum: 50 }
                    }
                }
            },
            preHandler: requireSecurityAccess
        },
        async (request, reply) => {
            const limit = request.query.limit || 10;
            const data = await service.getPendingApprovals(limit);
            return reply.send(data);
        }
    );

    // GET /api/admin/alerts — System alerts for unusual patterns
    app.get(
        '/alerts',
        {
            schema: {
                tags: ['Admin'],
                summary: 'Get system alerts for unusual patterns',
            },
            preHandler: requireSecurityAccess
        },
        async (request, reply) => {
            const alerts = await service.getAlerts();
            return reply.send(alerts);
        }
    );

    // GET /api/admin/users/:id/activity — User login history
    app.get<{ Params: { id: string } }>(
        '/users/:id/activity',
        {
            schema: {
                tags: ['Admin'],
                summary: 'Get user login history',
                params: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' }
                    }
                }
            },
            preHandler: requireExecutive
        },
        async (request, reply) => {
            const history = await service.getUserActivity(request.params.id);
            return reply.send(history);
        }
    );

    // POST /api/admin/users — Create new user
    app.post(
        '/users',
        {
            schema: {
                tags: ['Admin'],
                summary: 'Create a new user',
                body: {
                    type: 'object',
                    required: ['email', 'password', 'firstName', 'lastName', 'role'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', minLength: 6 },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        role: { type: 'string', enum: Object.values(Role) },
                        department: { type: 'string' },
                        employeeId: { type: 'string' }
                    }
                }
            },
            preHandler: requireExecutive
        },
        async (request, reply) => {
            try {
                const user = await service.createUser(request.body);
                return reply.code(201).send(user);
            } catch (error: any) {
                return reply.code(400).send({ message: error.message });
            }
        }
    );

    // GET /api/admin/password-requests/pending
    app.get(
        '/password-requests/pending',
        {
            schema: {
                tags: ['Admin', 'Security'],
                summary: 'Get pending password reset requests',
            },
            preHandler: requireSecurityAccess
        },
        async (request, reply) => {
            const requests = await service.getPendingPasswordRequests();
            return reply.send(requests);
        }
    );

    // POST /api/admin/password-requests/:id/approve
    app.post<{ Params: { id: string } }>(
        '/password-requests/:id/approve',
        {
            schema: {
                tags: ['Admin', 'Security'],
                summary: 'Approve password reset request',
                params: {
                    type: 'object',
                    properties: { id: { type: 'string' } }
                }
            },
            preHandler: requireSecurityAccess
        },
        async (request, reply) => {
            const adminId = (request.user as any).id;
            try {
                const result = await service.approvePasswordRequest(request.params.id, adminId);
                return reply.send(result);
            } catch (error: any) {
                return reply.status(400).send({ message: error.message });
            }
        }
    );

    // POST /api/admin/password-requests/:id/reject
    app.post<{ Params: { id: string } }>(
        '/password-requests/:id/reject',
        {
            schema: {
                tags: ['Admin', 'Security'],
                summary: 'Reject password reset request',
                params: {
                    type: 'object',
                    properties: { id: { type: 'string' } }
                }
            },
            preHandler: requireSecurityAccess
        },
        async (request, reply) => {
            const adminId = (request.user as any).id;
            try {
                const result = await service.rejectPasswordRequest(request.params.id, adminId);
                return reply.send(result);
            } catch (error: any) {
                return reply.status(400).send({ message: error.message });
            }
        }
    );
    // DELETE /api/admin/data/reset — Wipe all data
    app.delete(
        '/data/reset',
        {
            schema: {
                tags: ['Admin', 'Danger'],
                summary: 'Reset all system data (Attendance, Leaves)',
            },
            preHandler: requireExecutive // Strictly Executive Only
        },
        async (request, reply) => {
            const adminId = (request.user as any).id;
            try {
                const result = await service.resetSystemData(adminId);
                return reply.send(result);
            } catch (error: any) {
                return reply.status(500).send({ message: error.message });
            }
        }
    );
}

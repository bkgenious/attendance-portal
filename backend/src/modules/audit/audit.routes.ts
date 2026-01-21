import { FastifyInstance } from 'fastify';
import { AuditService } from './audit.service';
import { getAuditLogsSchema, GetAuditLogsInput } from './audit.schema';
import { isAdmin } from '../rbac/rbac.middleware';

export async function auditRoutes(app: FastifyInstance) {
    const service = new AuditService(app.prisma);

    app.addHook('onRequest', app.authenticate);

    // View Audit Logs (Admin only)
    // URL: GET /api/audit?page=1&limit=20&action=LOGIN
    app.get<{ Querystring: GetAuditLogsInput }>(
        '/',
        {
            preHandler: [isAdmin],
            schema: {
                querystring: getAuditLogsSchema,
                tags: ['Audit'],
            },
        },
        async (request, reply) => {
            const logs = await service.getLogs(request.query);
            return reply.send(logs);
        }
    );
}

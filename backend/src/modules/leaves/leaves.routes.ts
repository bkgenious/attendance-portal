import { FastifyInstance } from 'fastify';
import { LeaveService } from './leaves.service';
import { requestLeaveSchema, approveLeaveSchema, RequestLeaveInput, ApproveLeaveInput } from './leaves.schema';
import { isHR } from '../rbac/rbac.middleware';

export async function leavesRoutes(app: FastifyInstance) {
    const service = new LeaveService(app.prisma);

    app.addHook('onRequest', app.authenticate);

    app.post<{ Body: RequestLeaveInput }>(
        '/',
        {
            schema: {
                body: requestLeaveSchema,
                tags: ['Leaves'],
            },
        },
        async (request, reply) => {
            const userId = (request.user as any).id;
            const leave = await service.requestLeave(userId, request.body);
            return reply.status(201).send(leave);
        }
    );

    app.get(
        '/me',
        {
            schema: {
                tags: ['Leaves'],
            },
        },
        async (request, reply) => {
            const userId = (request.user as any).id;
            const leaves = await service.getMyLeaves(userId);
            return reply.send(leaves);
        }
    );

    // HR / Admin Routes
    app.get(
        '/pending',
        {
            preHandler: [isHR],
            schema: {
                tags: ['Leaves'],
            },
        },
        async (request, reply) => {
            const leaves = await service.getPendingLeaves();
            return reply.send(leaves);
        }
    );

    app.post<{ Params: { id: string }; Body: ApproveLeaveInput }>(
        '/:id/approve',
        {
            preHandler: [isHR],
            schema: {
                body: approveLeaveSchema,
                tags: ['Leaves'],
            },
        },
        async (request, reply) => {
            const approverId = (request.user as any).id;
            const { id } = request.params;
            const leave = await service.approveLeave(id, approverId, request.body);
            return reply.send(leave);
        }
    );
}

import { FastifyInstance } from 'fastify';
import { BreakService } from './breaks.service';
import { breakSchema } from './breaks.schema';

export async function breaksRoutes(app: FastifyInstance) {
    const service = new BreakService(app.prisma);

    app.addHook('onRequest', app.authenticate);

    app.post(
        '/start',
        {
            schema: {
                body: breakSchema,
                tags: ['Breaks'],
            },
        },
        async (request, reply) => {
            const userId = (request.user as any).id;
            const breakRecord = await service.startBreak(userId);
            return reply.send(breakRecord);
        }
    );

    app.post(
        '/end',
        {
            schema: {
                body: breakSchema,
                tags: ['Breaks'],
            },
        },
        async (request, reply) => {
            const userId = (request.user as any).id;
            const breakRecord = await service.endBreak(userId);
            return reply.send(breakRecord);
        }
    );

    app.get(
        '/today',
        {
            schema: {
                tags: ['Breaks'],
            },
        },
        async (request, reply) => {
            const userId = (request.user as any).id;
            const breaks = await service.getTodayBreaks(userId);
            return reply.send(breaks);
        }
    );
}

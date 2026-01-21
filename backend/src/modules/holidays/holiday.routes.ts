import { FastifyInstance } from 'fastify';
import { HolidayService } from './holiday.service';
import { Role } from '@prisma/client';
import { hasRole } from '../rbac/rbac.middleware';
import { z } from 'zod';

export async function holidayRoutes(app: FastifyInstance) {
    const service = new HolidayService(app.prisma);

    app.addHook('onRequest', app.authenticate);

    // Get all holidays
    app.get('/', async (request, reply) => {
        const holidays = await service.getAll();
        return reply.send(holidays);
    });

    // Get upcoming holidays
    app.get('/upcoming', async (request, reply) => {
        const holidays = await service.getUpcoming();
        return reply.send(holidays);
    });

    // Create Holiday (Admin only)
    app.post(
        '/',
        {
            preHandler: [hasRole([Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.HR, Role.CEO])],
            schema: {
                tags: ['Holidays'],
                body: z.object({
                    date: z.string(),
                    name: z.string(),
                    description: z.string().optional(),
                    isOptional: z.boolean().optional()
                })
            }
        },
        async (request, reply) => {
            const data = request.body as any;
            const holiday = await service.create(data);
            return reply.send(holiday);
        }
    );

    // Delete Holiday (Admin only)
    app.delete(
        '/:id',
        {
            preHandler: [hasRole([Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.HR, Role.CEO])],
            schema: {
                tags: ['Holidays'],
                params: z.object({ id: z.string() })
            }
        },
        async (request, reply) => {
            const { id } = request.params as any;
            await service.delete(id);
            return reply.send({ success: true });
        }
    );
}

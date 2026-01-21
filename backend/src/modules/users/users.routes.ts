import { FastifyInstance } from 'fastify';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { hasRole } from '../rbac/rbac.middleware';

export async function usersRoutes(app: FastifyInstance) {
    // List all users
    app.get(
        '/',
        {
            preHandler: [app.authenticate, hasRole([Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.HR, Role.CEO])],
            schema: {
                tags: ['Users'],
                querystring: z.object({
                    page: z.coerce.number().default(1),
                    limit: z.coerce.number().default(10),
                    search: z.string().optional(),
                }),
            },
        },
        async (request) => {
            const { page, limit, search } = request.query as any;
            const skip = (page - 1) * limit;

            const where: any = {};
            if (search) {
                where.OR = [
                    { email: { contains: search } },
                    { employeeProfile: { firstName: { contains: search } } },
                    { employeeProfile: { lastName: { contains: search } } },
                ];
            }

            const [users, total] = await Promise.all([
                app.prisma.user.findMany({
                    where,
                    skip,
                    take: limit,
                    include: { employeeProfile: true },
                    orderBy: { createdAt: 'desc' },
                }),
                app.prisma.user.count({ where }),
            ]);

            return { data: users, total, page, limit };
        }
    );

    // Update User Role/Status
    app.patch(
        '/:id',
        {
            preHandler: [app.authenticate, hasRole([Role.SUPER_ADMIN, Role.SYSTEM_ADMIN])],
            schema: {
                tags: ['Users'],
                params: z.object({ id: z.string() }),
                body: z.object({
                    role: z.nativeEnum(Role).optional(),
                    isActive: z.boolean().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { id } = request.params as any;
            const { role, isActive } = request.body as any;

            const user = await app.prisma.user.update({
                where: { id },
                data: { role, isActive },
            });

            return user;
        }
    );
}

import { FastifyInstance } from 'fastify';
import { AnnouncementService } from './announcements.service';

export async function announcementRoutes(app: FastifyInstance) {
    const service = new AnnouncementService(app.prisma);

    // Protect all routes
    app.addHook('onRequest', app.authenticate);

    // Role check for Super Admin only (for creating/deleting)
    const requireAdmin = async (request: any, reply: any) => {
        const user = request.user as any;
        if (!['SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(user.role)) {
            return reply.code(403).send({ message: 'Admin access required' });
        }
    };

    // GET /api/announcements — Get active announcements (all users)
    app.get(
        '/',
        {
            schema: {
                tags: ['Announcements'],
                summary: 'Get active announcements',
            }
        },
        async (request, reply) => {
            const announcements = await service.getActiveAnnouncements();
            return reply.send(announcements);
        }
    );

    // GET /api/announcements/all — Get all announcements (admin only)
    app.get(
        '/all',
        {
            schema: {
                tags: ['Announcements'],
                summary: 'Get all announcements including expired',
            },
            preHandler: requireAdmin
        },
        async (request, reply) => {
            const announcements = await service.getAllAnnouncements();
            return reply.send(announcements);
        }
    );

    // POST /api/announcements — Create announcement (admin only)
    app.post(
        '/',
        {
            schema: {
                tags: ['Announcements'],
                summary: 'Create a new announcement',
                body: {
                    type: 'object',
                    required: ['title', 'message', 'type'],
                    properties: {
                        title: { type: 'string', minLength: 1, maxLength: 100 },
                        message: { type: 'string', minLength: 1, maxLength: 500 },
                        type: { type: 'string', enum: ['info', 'warning', 'success'] },
                        expiresInHours: { type: 'integer', minimum: 1, maximum: 720 }
                    }
                }
            },
            preHandler: requireAdmin
        },
        async (request, reply) => {
            const user = request.user as any;
            const body = request.body as any;

            const announcement = await service.createAnnouncement({
                title: body.title,
                message: body.message,
                type: body.type,
                expiresInHours: body.expiresInHours,
                createdBy: user.id
            });

            return reply.code(201).send(announcement);
        }
    );

    // DELETE /api/announcements/:id — Delete announcement (admin only)
    app.delete<{ Params: { id: string } }>(
        '/:id',
        {
            schema: {
                tags: ['Announcements'],
                summary: 'Delete an announcement',
            },
            preHandler: requireAdmin
        },
        async (request, reply) => {
            const deleted = await service.deleteAnnouncement(request.params.id);
            if (!deleted) {
                return reply.code(404).send({ message: 'Announcement not found' });
            }
            return reply.send({ message: 'Deleted' });
        }
    );
}

import { FastifyInstance } from 'fastify';
import { SettingsService } from './settings.service';
import { Role } from '@prisma/client';
import { hasRole } from '../rbac/rbac.middleware';
import { z } from 'zod';

export async function settingsRoutes(app: FastifyInstance) {
    const service = new SettingsService(app.prisma);

    // Get Settings
    app.get(
        '/',
        {
            preHandler: [app.authenticate, hasRole([Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.CEO])],
            schema: {
                tags: ['Settings'],
                summary: 'Get system settings'
            }
        },
        async (request, reply) => {
            const settings = await service.getSettings();
            return reply.send(settings);
        }
    );

    // Update Settings
    app.patch(
        '/',
        {
            preHandler: [app.authenticate, hasRole([Role.SUPER_ADMIN, Role.SYSTEM_ADMIN])],
            schema: {
                tags: ['Settings'],
                summary: 'Update system settings',
                body: z.object({
                    companyName: z.string().optional(),
                    workStartTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
                    workEndTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
                    lateThreshold: z.number().min(0).optional(),
                    halfDayThreshold: z.number().min(1).optional(),
                    workingDays: z.array(z.number()).optional(),
                    currency: z.string().length(3).optional()
                })
            }
        },
        async (request, reply) => {
            const result = await service.updateSettings(request.body as any);
            return reply.send(result);
        }
    );
}

import { z } from 'zod';

export const getAuditLogsSchema = z.object({
    userId: z.string().optional(),
    action: z.enum(['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'OVERRIDE']).optional(),
    resource: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(50),
});

export type GetAuditLogsInput = z.infer<typeof getAuditLogsSchema>;

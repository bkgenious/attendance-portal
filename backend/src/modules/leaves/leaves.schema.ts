import { z } from 'zod';

export const requestLeaveSchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be YYYY-MM-DD' }),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be YYYY-MM-DD' }),
    reason: z.string().min(5, { message: 'Reason is required' }),
});

export const approveLeaveSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: z.string().optional(),
});

export type RequestLeaveInput = z.infer<typeof requestLeaveSchema>;
export type ApproveLeaveInput = z.infer<typeof approveLeaveSchema>;

import { z } from 'zod';

export const generatePayrollSchema = z.object({
    month: z.number().min(1).max(12),
    year: z.number().int().min(2020),
});

export const getPayslipSchema = z.object({
    month: z.number().min(1).max(12),
    year: z.number().int().min(2020),
    userId: z.string().optional(), // If Admin views someone else
});

export type GeneratePayrollInput = z.infer<typeof generatePayrollSchema>;
export type GetPayslipInput = z.infer<typeof getPayslipSchema>;

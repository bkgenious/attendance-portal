import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(1, { message: 'Password is required' }),
});

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum(['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HR', 'EMPLOYEE']).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

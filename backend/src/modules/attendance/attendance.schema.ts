import { z } from 'zod';

// Input for Check In - No time allowed!
export const checkInSchema = z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    notes: z.string().optional(),
});

// Input for Check Out
export const checkOutSchema = z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    notes: z.string().optional(),
});

// Input for Manual Leave/Absent Marking (Admin only)
export const updateAttendanceSchema = z.object({
    userId: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be YYYY-MM-DD' }),
    status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'ON_LEAVE']),
    checkIn: z.string().datetime().optional(), // Admin can override time
    checkOut: z.string().datetime().optional(),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;

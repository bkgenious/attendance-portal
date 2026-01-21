import { z } from 'zod';

// No input needed for start/end break, just the trigger
export const breakSchema = z.object({});

export type BreakInput = z.infer<typeof breakSchema>;

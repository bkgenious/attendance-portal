import { startOfDay, endOfDay, format } from 'date-fns';

/**
 * TimeService
 * 
 * CRITICAL SECURITY COMPONENT
 * 
 * This service is the SINGLE SOURCE OF TRUTH for all time-related operations.
 * Client-side time must NEVER be trusted for:
 * - Attendance punch times
 * - Leave request timestamps
 * - Audit logs
 * 
 * All times are returned in UTC (as JS Date objects).
 */
export class TimeService {
    /**
     * Returns the current server time in UTC.
     * This is the ONLY method that should be used to record "now".
     */
    static now(): Date {
        return new Date();
    }

    /**
     * Returns the start of the current day (00:00:00.000 UTC).
     * We accept that "Today" is defined by the Server's UTC date.
     * This ensures consistency regardless of server local timezone.
     */
    static startOfToday(): Date {
        const now = this.now();
        // Create a date at UTC midnight
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }

    /**
     * Returns the end of the current day (23:59:59.999 UTC).
     */
    static endOfToday(): Date {
        const now = this.now();
        // Create a date at UTC 23:59:59.999
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    }

    /**
     * Formats a date for display or logging (ISO format preferred).
     */
    static formatISO(date: Date): string {
        return date.toISOString();
    }
}

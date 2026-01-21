import { PrismaClient } from '@prisma/client';

// In-memory announcements (in production, this would be stored in DB)
interface Announcement {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    createdAt: Date;
    expiresAt: Date | null;
    createdBy: string;
}

let announcements: Announcement[] = [];

export class AnnouncementService {
    constructor(private prisma: PrismaClient) { }

    /**
     * Get all active announcements
     */
    async getActiveAnnouncements() {
        const now = new Date();
        return announcements.filter(a => !a.expiresAt || a.expiresAt > now);
    }

    /**
     * Create a new announcement
     */
    async createAnnouncement(data: {
        title: string;
        message: string;
        type: 'info' | 'warning' | 'success';
        expiresInHours?: number;
        createdBy: string;
    }) {
        const announcement: Announcement = {
            id: `ann_${Date.now()}`,
            title: data.title,
            message: data.message,
            type: data.type,
            createdAt: new Date(),
            expiresAt: data.expiresInHours
                ? new Date(Date.now() + data.expiresInHours * 60 * 60 * 1000)
                : null,
            createdBy: data.createdBy
        };

        announcements.unshift(announcement);
        return announcement;
    }

    /**
     * Delete an announcement
     */
    async deleteAnnouncement(id: string) {
        const index = announcements.findIndex(a => a.id === id);
        if (index !== -1) {
            announcements.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Get all announcements (including expired) for admin
     */
    async getAllAnnouncements() {
        return announcements;
    }
}

import { PrismaClient, SystemSettings, Prisma } from '@prisma/client';

export class SettingsService {
    constructor(private prisma: PrismaClient) { }

    /**
     * Get system settings. Creates default if none exist.
     */
    async getSettings(): Promise<SystemSettings> {
        const settings = await this.prisma.systemSettings.findFirst();

        if (!settings) {
            // Initialize default settings
            return this.prisma.systemSettings.create({
                data: {
                    companyName: 'My Company',
                    workStartTime: '09:00',
                    workEndTime: '18:00',
                    lateThreshold: 15,
                    halfDayThreshold: 4,
                    workingDays: [1, 2, 3, 4, 5],
                    currency: 'USD'
                }
            });
        }

        return settings;
    }

    /**
     * Update system settings.
     */
    async updateSettings(data: Prisma.SystemSettingsUpdateInput): Promise<SystemSettings> {
        const current = await this.getSettings();

        // Validation logic can go here (e.g., end time > start time)

        return this.prisma.systemSettings.update({
            where: { id: current.id },
            data
        });
    }
}

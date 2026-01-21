import { PrismaClient, Holiday } from '@prisma/client';

export class HolidayService {
    constructor(private prisma: PrismaClient) { }

    async getAll(): Promise<Holiday[]> {
        return this.prisma.holiday.findMany({
            orderBy: { date: 'asc' }
        });
    }

    async getUpcoming(): Promise<Holiday[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.prisma.holiday.findMany({
            where: {
                date: {
                    gte: today
                }
            },
            orderBy: { date: 'asc' },
            take: 5
        });
    }

    async create(data: { date: string | Date, name: string, description?: string, isOptional?: boolean }): Promise<Holiday> {
        const date = new Date(data.date);
        date.setUTCHours(0, 0, 0, 0);

        return this.prisma.holiday.create({
            data: {
                date,
                name: data.name,
                description: data.description,
                isOptional: data.isOptional || false
            }
        });
    }

    async delete(id: string): Promise<Holiday> {
        return this.prisma.holiday.delete({
            where: { id }
        });
    }
}

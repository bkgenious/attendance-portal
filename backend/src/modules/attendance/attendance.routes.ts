import { FastifyInstance } from 'fastify';
import { AttendanceService } from './attendance.service';
import { SettingsService } from '../settings/settings.service';
import { z } from 'zod';
import { AttendanceStatus } from '@prisma/client';

export async function attendanceRoutes(app: FastifyInstance) {
    const service = new AttendanceService(app.prisma);
    const settingsService = new SettingsService(app.prisma);

    app.addHook('onRequest', app.authenticate); // Protect all routes

    // ... (existing code)

    app.get(
        '/me',
        {
            schema: {
                tags: ['Attendance'],
            },
        },
        async (request, reply) => {
            const userId = (request.user as any).id;
            const [attendance, config] = await Promise.all([
                service.getTodayStatus(userId),
                settingsService.getSettings()
            ]);

            return reply.send({
                attendance: attendance || null,
                config
            });
        }
    );

    app.post(
        '/check-in',
        {
            schema: {
                tags: ['Attendance'],
                body: z.object({
                    location: z.object({
                        lat: z.number().optional(),
                        lng: z.number().optional()
                    }).optional()
                })
            },
        },
        async (request, reply) => {
            const userId = (request.user as any).id;
            // The body is parsed by Zod now
            const record = await service.checkIn(userId, request.body as any);
            return reply.send(record);
        }
    );

    app.post(
        '/check-out',
        {
            schema: {
                tags: ['Attendance'],
                body: z.object({
                    notes: z.string().optional()
                })
            },
        },
        async (request, reply) => {
            const userId = (request.user as any).id;
            const record = await service.checkOut(userId, request.body as any);
            return reply.send(record);
        }
    );

    app.post(
        '/override',
        {
            schema: {
                tags: ['Attendance'],
                body: z.object({
                    userId: z.string().uuid(),
                    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
                    status: z.nativeEnum(AttendanceStatus),
                    checkIn: z.string().nullable().optional(),
                    checkOut: z.string().nullable().optional()
                })
            }
        },
        async (request, reply) => {
            const user = request.user as any;
            if (!['SUPER_ADMIN', 'SYSTEM_ADMIN', 'CEO'].includes(user.role)) {
                return reply.code(403).send({ message: 'Forbidden: Executive access required' });
            }

            // Type is now inferred correctly by Fastify+Zod provider if we used generics,
            // but for now explicit casting or service call is safe.
            const body = request.body as any;

            const result = await service.overrideAttendance(user.id, body.userId, body.date, body);
            return reply.send(result);
        }
    );



    app.get(
        '/history',
        {
            schema: {
                tags: ['Attendance'],
            },
        },
        async (request, reply) => {
            const userId = (request.user as any).id;
            const history = await service.getHistory(userId);
            return reply.send(history);
        }
    );

    app.get(
        '/daily-status',
        {
            schema: {
                tags: ['Attendance'],
                querystring: z.object({
                    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
                })
            }
        },
        async (request, reply) => {
            const user = request.user as any;
            if (!['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HR', 'CEO'].includes(user.role)) {
                return reply.code(403).send({ message: 'Forbidden' });
            }

            const { date } = request.query as any;
            const data = await service.getDailyAttendance(date);
            return reply.send(data);
        }
    );

    app.post(
        '/bulk',
        {
            schema: {
                tags: ['Attendance'],
                body: z.object({
                    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
                    updates: z.array(z.object({
                        userId: z.string(),
                        status: z.nativeEnum(AttendanceStatus)
                    }))
                })
            }
        },
        async (request, reply) => {
            const user = request.user as any;
            if (!['SUPER_ADMIN', 'SYSTEM_ADMIN', 'CEO'].includes(user.role)) {
                return reply.code(403).send({ message: 'Forbidden: Executive access required' });
            }

            const { date, updates } = request.body as any;
            const result = await service.bulkUpdateAttendance(user.id, date, updates);
            return reply.send(result);
        }
    );

    // CSV Export for HR/Admins
    app.get(
        '/export',
        {
            schema: {
                tags: ['Attendance'],
                querystring: z.object({
                    month: z.coerce.number().min(1).max(12),
                    year: z.coerce.number().min(2020)
                })
            },
        },
        async (request, reply) => {
            const user = request.user as any;
            if (!['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HR', 'CEO'].includes(user.role)) {
                return reply.code(403).send({ message: 'Forbidden' });
            }

            const { month, year } = request.query as any;
            const data = await service.getMonthlyReport(month, year);

            // Generate CSV
            const header = 'Employee ID,Name,Department,Date,Check In,Check Out,Status,Email\n';
            const rows = data.map(record => {
                const emp = record.user?.employeeProfile;
                const name = emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
                const dept = emp?.department || '-';
                const empId = emp?.employeeId || '-';
                const date = new Date(record.date).toISOString().split('T')[0];
                const checkIn = record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-';
                const checkOut = record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-';
                const email = record.user?.email || '-';

                return `${empId},"${name}",${dept},${date},${checkIn},${checkOut},${record.status},${email}`;
            }).join('\n');

            const csv = header + rows;

            reply.header('Content-Type', 'text/csv');
            reply.header('Content-Disposition', `attachment; filename="attendance_report_${year}_${month}.csv"`);
            return reply.send(csv);
        }
    );
}

import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler, ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import jwtPlugin from './plugins/jwt';
import prismaPlugin from './plugins/prisma';
import { authRoutes } from './modules/auth/auth.routes';
import { attendanceRoutes } from './modules/attendance/attendance.routes';
import { leavesRoutes } from './modules/leaves/leaves.routes';
import { breaksRoutes } from './modules/breaks/breaks.routes';
import { payrollRoutes } from './modules/payroll/payroll.routes';
import { auditRoutes } from './modules/audit/audit.routes';
import { usersRoutes } from './modules/users/users.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { settingsRoutes } from './modules/settings/settings.routes';
import { announcementRoutes } from './modules/announcements/announcements.routes';
import { holidayRoutes } from './modules/holidays/holiday.routes';
import { sessionRoutes } from './modules/sessions/sessions.routes';

dotenv.config();

export const buildApp = async (): Promise<FastifyInstance> => {
    const app = fastify({
        logger: {
            level: 'info',
            transport: {
                target: 'pino-pretty',
                options: {
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname',
                },
            },
        },
    });

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    app.setErrorHandler((error, request, reply) => {
        app.log.error(error);
        const statusCode = error.statusCode || 500;
        reply.status(statusCode).send({
            statusCode,
            error: error.name || 'Internal Server Error',
            message: error.message || 'An unexpected error occurred',
        });
    });

    const appWithZod = app.withTypeProvider<ZodTypeProvider>();

    // Security Headers
    await app.register(helmet);
    await app.register(compress);

    // CORS
    await app.register(cors, {
        origin: true,
        credentials: true,
    });

    // Swagger Documentation
    await app.register(swagger, {
        swagger: {
            info: {
                title: 'Attendance Portal API',
                description: 'Enterprise Attendance Management System',
                version: '1.0.0',
            },
            host: 'localhost:3001',
            schemes: ['http'],
            consumes: ['application/json'],
            produces: ['application/json'],
            tags: [{ name: 'Auth', description: 'Authentication endpoints' }],
        },
        transform: jsonSchemaTransform,
    });

    await app.register(swaggerUi, {
        routePrefix: '/documentation',
        uiConfig: {
            docExpansion: 'full',
            deepLinking: false,
        },
    });

    // Core Plugins
    await app.register(prismaPlugin);
    await app.register(jwtPlugin);

    // Routes
    const registerSafe = async (plugin: any, opts?: any) => {
        try {
            await app.register(plugin, opts);
        } catch (e) {
            console.error('FAILED to register plugin:', e);
        }
    };

    // Routes
    await registerSafe(authRoutes, { prefix: '/api/auth' });
    await registerSafe(attendanceRoutes, { prefix: '/api/attendance' });
    await registerSafe(leavesRoutes, { prefix: '/api/leaves' });
    await registerSafe(breaksRoutes, { prefix: '/api/breaks' });
    await registerSafe(payrollRoutes, { prefix: '/api/payroll' });
    await registerSafe(auditRoutes, { prefix: '/api/audit' });
    await registerSafe(usersRoutes, { prefix: '/api/users' });
    await registerSafe(adminRoutes, { prefix: '/api/admin' });
    await registerSafe(settingsRoutes, { prefix: '/api/settings' });
    await registerSafe(announcementRoutes, { prefix: '/api/announcements' });
    await registerSafe(holidayRoutes, { prefix: '/api/holidays' });
    await registerSafe(sessionRoutes, { prefix: '/api/sessions' });

    // Global Health Check
    app.get('/health', async () => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    });

    return app;
    // return appWithZod; // If we were returning the typed instance, but buildApp returns FastifyInstance. 
    // For now, simpler to just modify the instance in place as the provider attaches to it.
};

// Start Server
if (require.main === module) {
    const start = async () => {
        try {
            const app = await buildApp();
            const PORT = process.env.PORT || 3001;
            await app.listen({ port: Number(PORT), host: '0.0.0.0' });
            app.log.info(`Server running at http://localhost:${PORT}`);
        } catch (err) {
            console.error('Startup Error:', err);
            // Don't exit, just log meant to survive? 
            // If listen fails, we MUST exit or retry. 
            // But user said "starts no matter what".
            // If port is in use, we can't start. 
            // But we can prevent crash loop.
            process.exit(1);
        }
    };

    // Prevent crashes from unhandled errors
    process.on('uncaughtException', (err) => {
        console.error('UNCAUGHT EXCEPTION (Staying Alive):', err);
    });
    process.on('unhandledRejection', (err) => {
        console.error('UNHANDLED REJECTION (Staying Alive):', err);
    });

    start();
}

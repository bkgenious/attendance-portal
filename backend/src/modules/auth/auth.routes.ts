import { FastifyInstance } from 'fastify';
import { loginSchema, registerSchema, LoginInput, RegisterInput } from './auth.schema';
import { z } from 'zod'; // Import z
import bcrypt from 'bcrypt';

export async function authRoutes(app: FastifyInstance) {
    app.post<{ Body: RegisterInput }>(
        '/register',
        {
            schema: {
                body: registerSchema,
                tags: ['Auth'],
                response: {
                    201: z.object({
                        message: z.string(),
                        userId: z.string(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { email, password, firstName, lastName, role } = request.body;

            // Check if user exists
            const existingUser = await app.prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return reply.status(409).send({ message: 'User already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = await app.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: role || 'EMPLOYEE',
                    employeeProfile: {
                        create: {
                            firstName,
                            lastName,
                            employeeId: 'EMP' + Date.now(), // Temporary ID generation
                        },
                    },
                },
            });

            return reply.status(201).send({ message: 'User created', userId: user.id });
        }
    );

    app.post<{ Body: LoginInput }>(
        '/login',
        {
            schema: {
                body: loginSchema,
                tags: ['Auth'],
            },
        },
        async (request, reply) => {
            const { email, password } = request.body;
            console.log('Login attempt:', email);

            // Find user
            const user = await app.prisma.user.findUnique({
                where: { email },
            });

            if (!user || !user.isActive) {
                console.log('User not found or inactive');
                return reply.status(401).send({ message: 'Invalid credentials' });
            }

            // Verify password
            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                console.log('Invalid password');
                return reply.status(401).send({ message: 'Invalid credentials' });
            }

            console.log('Password valid. Generating token...');

            // Generate JWT
            const token = app.jwt.sign({
                id: user.id,
                email: user.email,
                role: user.role,
            });

            console.log('Creating session...');
            // Create Session
            await app.prisma.session.create({
                data: {
                    userId: user.id,
                    token,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
                    ipAddress: request.ip,
                    userAgent: request.headers['user-agent'] || 'Unknown'
                }
            });
            console.log('Session created. Sending response.');

            return { token };
        }
    );

    app.post(
        '/forgot-password',
        {
            schema: {
                body: z.object({
                    email: z.string().email(),
                    newPassword: z.string().min(8)
                }),
                tags: ['Auth'],
                response: {
                    201: z.object({ message: z.string() }),
                    404: z.object({ message: z.string() })
                }
            }
        },
        async (request, reply) => {
            const { email, newPassword } = request.body as any;

            const user = await app.prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                return reply.status(404).send({ message: 'User not found' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await (app.prisma as any).passwordResetRequest.create({
                data: {
                    userId: user.id,
                    newPasswordHash: hashedPassword,
                    status: 'PENDING'
                }
            });

            return reply.status(201).send({ message: 'Password reset request submitted for approval' });
        }
    );

    app.get(
        '/me',
        {
            onRequest: [app.authenticate],
            schema: {
                tags: ['Auth'],
            },
        },
        async (request, reply) => {
            const userId = request.user.id;
            const user = await app.prisma.user.findUnique({
                where: { id: userId },
                include: { employeeProfile: true },
            });
            return user;
        }
    );
}

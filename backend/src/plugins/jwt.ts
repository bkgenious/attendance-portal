import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';

export default fp(async (fastify) => {
    fastify.register(fastifyJwt, {
        secret: process.env.JWT_SECRET || 'supersecret',
    });

    fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();

            const token = request.headers.authorization?.split(' ')[1];
            if (token) {
                // Verify session exists and is valid
                const session = await fastify.prisma.session.findFirst({
                    where: {
                        token,
                        isValid: true
                    }
                });

                if (!session) {
                    return reply.code(401).send({ message: 'Session expired or revoked' });
                }
            }
        } catch (err) {
            reply.send(err);
        }
    });
});

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

import '@fastify/jwt';

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: { id: string; email: string; role: string }; // payload type is used for signing and verifying
        user: { id: string; email: string; role: string; iat: number; exp: number }; // user type is return type of `request.user` object
    }
}

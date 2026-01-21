import { FastifyReply, FastifyRequest } from 'fastify';
import { Role } from '@prisma/client';

export function hasRole(allowedRoles: Role[]) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        // Ensure user is authenticated first (request.user should be populated by jwt)
        if (!request.user) {
            return reply.code(401).send({ message: 'Unauthorized: No user found' });
        }

        const start = Date.now();
        // Use type assertion or extended generic to access role on user
        // fastify-jwt types define user as any or generic, we need to ensure it matches our payload
        const userRole = (request.user as { role: Role }).role;

        if (!allowedRoles.includes(userRole)) {
            // Audit Log for unauthorized access attempt could go here
            return reply.code(403).send({
                message: 'Forbidden: Insufficient permissions',
                required: allowedRoles,
                current: userRole
            });
        }
    };
}

// Helper for specific common checks
export const isAdmin = hasRole([Role.SUPER_ADMIN, Role.SYSTEM_ADMIN]);
export const isHR = hasRole([Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.HR]);

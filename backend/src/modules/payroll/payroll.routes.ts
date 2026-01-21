import { FastifyInstance } from 'fastify';
import { PayrollService } from './payroll.service';
import { generatePayrollSchema, getPayslipSchema, GeneratePayrollInput, GetPayslipInput } from './payroll.schema';
import { isHR } from '../rbac/rbac.middleware';

export async function payrollRoutes(app: FastifyInstance) {
    const service = new PayrollService(app.prisma);

    app.addHook('onRequest', app.authenticate);

    // Generate Payslip (HR/Admin only)
    // URL: POST /api/payroll/generate/:userId
    app.post<{ Params: { userId: string }; Body: GeneratePayrollInput }>(
        '/generate/:userId',
        {
            preHandler: [isHR],
            schema: {
                body: generatePayrollSchema,
                tags: ['Payroll'],
            },
        },
        async (request, reply) => {
            const generatorId = (request.user as any).id;
            const { userId } = request.params;
            const { month, year } = request.body;

            const payslip = await service.generatePayslip(userId, month, year, generatorId);
            return reply.send(payslip);
        }
    );

    // View Payslip
    // URL: GET /api/payroll?month=1&year=2024
    app.get<{ Querystring: GetPayslipInput }>(
        '/',
        {
            schema: {
                querystring: getPayslipSchema,
                tags: ['Payroll'],
            },
        },
        async (request, reply) => {
            // If user is Employee, can only see own.
            // If HR, can see others if userId provided.

            const requesterId = (request.user as any).id;
            const requesterRole = (request.user as any).role;
            const { month, year, userId } = request.query;

            let targetUserId = requesterId;

            if (userId && userId !== requesterId) {
                // Checking someone else
                if (['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HR'].includes(requesterRole)) {
                    targetUserId = userId;
                } else {
                    return reply.status(403).send({ message: 'Forbidden' });
                }
            }

            const payslip = await service.getPayslip(targetUserId, Number(month), Number(year));

            if (!payslip) {
                return reply.status(404).send({ message: 'Payslip not found' });
            }

            return reply.send(payslip);
        }
    );
}

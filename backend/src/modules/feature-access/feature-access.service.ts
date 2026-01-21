import { Role, User } from '@prisma/client';

export type FeatureKey =
    | 'VIEW_ATTENDANCE'
    | 'EDIT_ATTENDANCE'
    | 'VIEW_LEAVES'
    | 'APPROVE_LEAVES'
    | 'VIEW_PAYROLL'
    | 'MANAGE_PAYROLL'
    | 'VIEW_AUDIT_LOGS'
    | 'MANAGE_USERS'
    | 'SYSTEM_CONFIG';

const ROLE_DEFAULTS: Record<Role, FeatureKey[]> = {
    SUPER_ADMIN: [
        'VIEW_ATTENDANCE', 'EDIT_ATTENDANCE',
        'VIEW_LEAVES', 'APPROVE_LEAVES',
        'VIEW_PAYROLL', 'MANAGE_PAYROLL',
        'VIEW_AUDIT_LOGS', 'MANAGE_USERS', 'SYSTEM_CONFIG'
    ],
    SYSTEM_ADMIN: [
        'VIEW_ATTENDANCE', 'EDIT_ATTENDANCE',
        'VIEW_LEAVES', 'APPROVE_LEAVES',
        'VIEW_PAYROLL', 'MANAGE_PAYROLL',
        'VIEW_AUDIT_LOGS', 'MANAGE_USERS'
        // Cannot SYSTEM_CONFIG (SUPER_ADMIN only)
    ],
    CEO: [
        'VIEW_ATTENDANCE', 'VIEW_LEAVES',
        'VIEW_PAYROLL', 'VIEW_AUDIT_LOGS'
        // Read-only executive view typically
    ],
    HR: [
        'VIEW_ATTENDANCE', 'EDIT_ATTENDANCE',
        'VIEW_LEAVES', 'APPROVE_LEAVES',
        'VIEW_PAYROLL'
    ],
    EMPLOYEE: [
        'VIEW_ATTENDANCE', // Own attendance
        'VIEW_LEAVES'      // Own leaves
    ]
};

export class FeatureAccessService {
    static hasAccess(user: User, feature: FeatureKey): boolean {
        const roleFeatures = ROLE_DEFAULTS[user.role];
        let hasAccess = roleFeatures.includes(feature);

        // Check Overrides
        if (user.featureOverrides) {
            const overrides = user.featureOverrides as Record<string, boolean>;
            if (typeof overrides[feature] === 'boolean') {
                hasAccess = overrides[feature];
            }
        }

        return hasAccess;
    }

    static getAccessibleFeatures(user: User): FeatureKey[] {
        const roleFeatures = new Set(ROLE_DEFAULTS[user.role]);

        if (user.featureOverrides) {
            const overrides = user.featureOverrides as Record<string, boolean>;
            for (const [key, enabled] of Object.entries(overrides)) {
                if (enabled) {
                    roleFeatures.add(key as FeatureKey);
                } else {
                    roleFeatures.delete(key as FeatureKey);
                }
            }
        }

        return Array.from(roleFeatures) as FeatureKey[];
    }
}

export enum UserRole {
    CLIENTE = 'CLIENTE',
    CORRETOR = 'CORRETOR',
    ADMIN = 'ADMIN'
}

export enum UserPlan {
    FREE = 'FREE',
    PRO = 'PRO'
}

export enum SubscriptionStatus {
    ACTIVE = 'active',
    CANCELED = 'canceled',
    TRIALING = 'trialing',
    PAST_DUE = 'past_due',
    INCOMPLETE = 'incomplete'
}

export const SYSTEM_LIMITS = {
    FREE_SIMULATIONS: 5,
    PRO_SIMULATIONS: Infinity,
} as const;

export interface SystemUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    plan: UserPlan;
    status: SubscriptionStatus | string;
    simulationsCount: number;
    setupCompleted: boolean;
    stripeCustomerId?: string;
    subscriptionId?: string;
}

// Logic to determine if user can simulate
export const canUserSimulate = (user: SystemUser | null): boolean => {
    if (!user) return true; // Guest mode usually allowed up to a point, but here we track
    if (user.plan === UserPlan.PRO) return true;
    return user.simulationsCount < SYSTEM_LIMITS.FREE_SIMULATIONS;
};

// Logic to check if user is blocked (no profile or setup incomplete)
export const isUserRestricted = (user: SystemUser | null): boolean => {
    if (!user) return false; // Guest
    return !user.setupCompleted;
};

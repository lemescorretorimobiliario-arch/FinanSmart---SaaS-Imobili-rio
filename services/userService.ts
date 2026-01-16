import { supabase } from '../utils/supabaseClient';
import { UserProfile } from '../types';
import { UserRole, UserPlan, SubscriptionStatus } from '../core/system';

export const userService = {
    mapProfileToUser: (profile: any): UserProfile => ({
        id: profile.id,
        name: profile.full_name || 'Usuário',
        email: profile.email,
        phone: profile.phone,
        avatarUrl: profile.avatar_url,
        coverUrl: profile.cover_url,
        plan: profile.plan as UserPlan,
        type: profile.user_type as UserRole,
        simulationsCount: profile.simulations_count || 0,
        setupCompleted: profile.setup_completed || false,
        stripeCustomerId: profile.stripe_customer_id,
        subscriptionId: profile.subscription_id,
        subscriptionStatus: profile.subscription_status
    }),

    async getProfile(userId: string): Promise<UserProfile | null> {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !profile) return null;
        return this.mapProfileToUser(profile);
    },

    async updateProfile(user: Partial<UserProfile> & { id: string }): Promise<void> {
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: user.name,
                phone: user.phone,
                avatar_url: user.avatarUrl,
                cover_url: user.coverUrl,
                plan: user.plan,
                simulations_count: user.simulationsCount,
                setup_completed: user.setupCompleted,
                user_type: user.type,
                stripe_customer_id: user.stripeCustomerId,
                subscription_id: user.subscriptionId,
                subscription_status: user.subscriptionStatus
            })
            .eq('id', user.id);

        if (error) throw error;
    },

    async getAllUsers(): Promise<UserProfile[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(this.mapProfileToUser);
    }
};

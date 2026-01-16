import { supabase } from '../utils/supabaseClient';
import { SimulationData, SavedSimulation } from '../types';

export const simulationService = {
    /**
     * Saves a simulation to the database.
     * This is mandatory according to the new architecture.
     */
    async saveSimulation(userId: string, data: SimulationData, monthlyPayment: number): Promise<void> {
        const { error } = await supabase
            .from('saved_simulations')
            .insert({
                user_id: userId,
                property_value: data.propertyValue,
                down_payment: data.downPayment,
                interest_rate_annual: data.interestRateAnnual,
                term_years: data.termYears,
                amortization_system: data.amortizationSystem,
                monthly_income: data.monthlyIncome,
                monthly_payment: monthlyPayment
            });

        if (error) {
            console.error("Critical Error saving simulation record:", error);
            throw new Error("Failed to register simulation in history.");
        }

        // Increment simulation count in profile
        const { error: updateError } = await supabase.rpc('increment_simulations_count', {
            user_id: userId
        });

        if (updateError) {
            // If RPC fails (maybe not exists), fallback to manual update
            const { data: profile } = await supabase.from('profiles').select('simulations_count').eq('id', userId).single();
            await supabase.from('profiles').update({
                simulations_count: (profile?.simulations_count || 0) + 1
            }).eq('id', userId);
        }
    },

    /**
     * Fetches the simulation history for a specific user.
     */
    async getHistory(userId: string): Promise<SavedSimulation[]> {
        const { data, error } = await supabase
            .from('saved_simulations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(item => ({
            id: item.id,
            date: item.created_at,
            propertyValue: item.property_value,
            downPayment: item.down_payment,
            termYears: item.term_years,
            monthlyPayment: item.monthly_payment,
            interestRate: item.interest_rate_annual,
            amortizationSystem: item.amortization_system as any,
            monthlyIncome: item.monthly_income
        }));
    }
};

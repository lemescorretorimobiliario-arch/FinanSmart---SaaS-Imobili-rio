import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { UserProfile } from '../types';
import { userService } from '../services/userService';
import { toast } from 'sonner';

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            let profile = await userService.getProfile(userId);

            if (!profile) {
                // Fallback or Initial Creation
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const meta = session.user.user_metadata || {};
                    const { data: newProfile, error } = await supabase
                        .from('profiles')
                        .insert({
                            id: session.user.id,
                            email: session.user.email,
                            full_name: meta.full_name || meta.name || 'Usuário',
                            avatar_url: meta.avatar_url || meta.picture,
                            user_type: 'CLIENTE',
                            plan: 'FREE',
                            setup_completed: false
                        })
                        .select()
                        .single();

                    if (newProfile) profile = userService.mapProfileToUser(newProfile);
                }
            }

            setUser(profile);
        } catch (error) {
            console.error("Auth fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial Session Check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for Auth Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                fetchProfile(session.user.id);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const refreshUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) await fetchProfile(session.user.id);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, refreshUser, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

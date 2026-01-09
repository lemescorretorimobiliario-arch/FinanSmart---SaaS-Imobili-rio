import { supabase } from './supabaseClient';
import { UserProfile } from '../types';

// Helper to map Supabase DB Profile to App UserProfile
const mapProfileToUser = (profile: any): UserProfile => ({
  id: profile.id,
  name: profile.full_name || 'Usuário',
  email: profile.email,
  phone: profile.phone,
  avatarUrl: profile.avatar_url,
  coverUrl: profile.cover_url,
  plan: profile.plan as 'FREE' | 'PRO',
  type: profile.user_type as 'CORRETOR' | 'CLIENTE',
  simulationsCount: profile.simulations_count || 0
});

export const getStoredUser = async (): Promise<UserProfile | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) return null;
  return mapProfileToUser(profile);
};

export const loginWithEmail = async (email: string, password: string): Promise<UserProfile> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  if (!data.session) throw new Error('Erro ao iniciar sessão.');

  // Fetch Profile Data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.session.user.id)
    .single();

  if (profileError || !profile) throw new Error('Perfil de usuário não encontrado.');

  return mapProfileToUser(profile);
};

export const registerUser = async (userData: { name: string; email: string; password: string; type: 'CORRETOR' | 'CLIENTE' }): Promise<UserProfile> => {
  // Sign up creates the Auth User. 
  // The SQL Trigger (handle_new_user) MUST be set up in Supabase to create the Profile row automatically.
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        full_name: userData.name,
        user_type: userData.type
      }
    }
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Erro no cadastro.');

  // Optimistic return or fetch
  return {
    id: data.user.id,
    name: userData.name,
    email: userData.email,
    type: userData.type,
    plan: 'FREE',
    simulationsCount: 0
  };
};

export const googleLogin = async (userType: 'CORRETOR' | 'CLIENTE'): Promise<void> => {
  // Google login redirects, so we pass metadata to be handled by trigger on return
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        // Note: passing custom data to OAuth for triggers is tricky. 
        // For simplicity in this demo, the user might need to set type after login if not using a custom flow.
        // Assuming the trigger handles defaults or updates.
      }
    }
  });
};

export const updateUserProfile = async (user: UserProfile): Promise<UserProfile> => {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: user.name,
      phone: user.phone,
      avatar_url: user.avatarUrl,
      cover_url: user.coverUrl,
      plan: user.plan,
      simulations_count: user.simulationsCount
    })
    .eq('id', user.id);

  if (error) throw new Error(error.message);
  return user;
};

export const logout = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('finansmart_user'); // Clear legacy if exists
};
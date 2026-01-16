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
  simulationsCount: profile.simulations_count || 0,
  setupCompleted: profile.setup_completed || false,
  stripeCustomerId: profile.stripe_customer_id,
  subscriptionId: profile.subscription_id,
  subscriptionStatus: profile.subscription_status
});

export const getStoredUser = async (): Promise<UserProfile | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    // FALLBACK: Se o perfil não existe (trigger falhou?), cria agora para não bloquear o usuário.
    console.warn("Perfil não encontrado. Tentando criar automaticamente...");

    // Obter dados meta da sessão
    const meta = session.user.user_metadata || {};

    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: session.user.id,
        email: session.user.email,
        full_name: meta.full_name || meta.name || 'Usuário',
        avatar_url: meta.avatar_url || meta.picture,
        user_type: 'CLIENTE', // Padrão seguro, muda no onboarding
        plan: 'FREE',
        simulations_count: 0,
        setup_completed: false
      })
      .select()
      .single();

    if (createError || !newProfile) {
      console.error("ERRO CRÍTICO: Falha ao auto-criar perfil.", createError);
      return null;
    }

    return mapProfileToUser(newProfile);
  }

  return mapProfileToUser(profile);
};

export const loginWithEmail = async (email: string, password: string): Promise<UserProfile> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  if (!data.session) throw new Error('Erro ao iniciar sessão.');

  // Reuse getStoredUser logic to handle profile check/auto-create
  const user = await getStoredUser();
  if (!user) throw new Error('Sessão criada, mas perfil inacessível.');

  return user;
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
    simulationsCount: 0,
    setupCompleted: true // Email registration already selects type
  };
};

export const googleLogin = async (userType: 'CORRETOR' | 'CLIENTE'): Promise<void> => {
  // Google login redirects, so we pass metadata to be handled by trigger on return
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
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
      simulations_count: user.simulationsCount,
      setup_completed: user.setupCompleted,
      user_type: user.type,
      stripe_customer_id: user.stripeCustomerId,
      subscription_id: user.subscriptionId,
      subscription_status: user.subscriptionStatus
    })
    .eq('id', user.id);

  if (error) throw new Error(error.message);
  return user;
};

export const logout = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('finansmart_user'); // Clear legacy if exists
};
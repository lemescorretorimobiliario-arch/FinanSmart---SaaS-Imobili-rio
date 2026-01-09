import { createClient } from '@supabase/supabase-js';

// Utility to safely get environment variables across different environments
const getEnvironmentVariable = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key] || '';
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || '';
    }
  } catch (e) {
    console.warn('Error reading environment variable', e);
  }
  return '';
};

// --- CONFIGURAÇÃO DO PROJETO ---
// As variáveis DEVEM estar no arquivo .env
const supabaseUrl = getEnvironmentVariable('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvironmentVariable('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing! Check your .env file.');
}

// Helper to check configuration status
export const isSupabaseConfigured = (): boolean => {
  // Strict validation: URL must look like a URL and Key must be present
  const hasUrl = !!supabaseUrl && supabaseUrl.includes('supabase.co');
  // Supabase JWTs typically start with 'eyJ'
  const hasKey = !!supabaseAnonKey && supabaseAnonKey.startsWith('eyJ');
  return hasUrl && hasKey;
};

// Initialize Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
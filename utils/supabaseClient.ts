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
// Em produção, mantenha estas variáveis no arquivo .env
const PROJECT_URL = 'https://ohusikzbdszflbnidpum.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9odXNpa3piZHN6ZmxibmlkcHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjM2NzgsImV4cCI6MjA4MzUzOTY3OH0.9MEAdn6D8MFlEwA4boTF51jhnDrghyxQmVoPLz64bEw';

// Tenta pegar do .env, se não existir, usa as credenciais fornecidas
const supabaseUrl = getEnvironmentVariable('VITE_SUPABASE_URL') || PROJECT_URL;
const supabaseAnonKey = getEnvironmentVariable('VITE_SUPABASE_ANON_KEY') || ANON_KEY;

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
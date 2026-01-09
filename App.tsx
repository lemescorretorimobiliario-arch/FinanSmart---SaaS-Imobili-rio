import React, { useState, useRef, useEffect } from 'react';
import { Layout, LogOut, Lock, LayoutDashboard, Calculator as CalcIcon, UserCircle, Menu, Edit3, PieChart, Star, Database, AlertTriangle, CheckCircle, Copy, Terminal, Settings, Key, Sparkles, Check } from 'lucide-react';
import { SimulationData, CalculationResult, UserProfile, LeadData, SavedSimulation } from './types';
import { calculateSimulation, formatCurrency, parseCurrency } from './utils/finance';
import { logout, getStoredUser, updateUserProfile } from './utils/auth';
import { supabase, isSupabaseConfigured } from './utils/supabaseClient';
import { subscribeToPro } from './utils/stripePayment';
import CalculatorForm from './components/CalculatorForm';
import ResultDashboard from './components/ResultDashboard';
import BankCarousel from './components/BankCarousel';
import LeadModal from './components/LeadModal';
import AgentDashboard from './components/AgentDashboard';
import ClientDashboard from './components/ClientDashboard';
import UserProfilePanel from './components/UserProfilePanel';
import AuthScreen from './components/AuthScreen';

// Helper for safe ID generation
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// SQL Script for user convenience
// UPDATED: Added subscription columns for Stripe integration
const REQUIRED_SQL_SCRIPT = `
-- ==============================================================================
-- SCRIPT MESTRE FINANSMART (CORREÇÃO & MIGRAÇÃO)
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELAS E MIGRAÇÕES

-- 2.1 PERFIS (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text UNIQUE,
    full_name text,
    phone text,
    user_type text CHECK (user_type IN ('CORRETOR', 'CLIENTE', 'ADMIN')),
    plan text DEFAULT 'FREE',
    simulations_count int DEFAULT 0,
    stripe_customer_id text,
    subscription_id text,
    subscription_status text DEFAULT 'active',
    avatar_url text,
    cover_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
-- Migração para tabelas antigas
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status text;


-- 2.2 LEADS
CREATE TABLE IF NOT EXISTS public.leads (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    status text DEFAULT 'NOVO',
    interest text,
    source text DEFAULT 'MANUAL',
    temperature text DEFAULT 'MORNO',
    simulation_data jsonb,
    notes text,
    last_contacted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
-- Migração para tabelas antigas
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS simulation_data jsonb;


-- 2.3 SIMULAÇÕES SALVAS
CREATE TABLE IF NOT EXISTS public.saved_simulations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    property_value numeric,
    down_payment numeric,
    term_years int,
    monthly_payment numeric,
    interest_rate_annual numeric,
    amortization_system text,
    monthly_income numeric,
    title text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2.4 TAREFAS
CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text,
    due_date timestamp with time zone,
    is_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2.5 WEBHOOK LOGS (Para debug do Stripe)
CREATE TABLE IF NOT EXISTS public.stripe_events (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id text UNIQUE,
    event_type text,
    payload jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true) ON CONFLICT (id) DO NOTHING;

-- 4. SEGURANÇA (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Reset Policies
DROP POLICY IF EXISTS "Public profiles" ON profiles;
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Self update profiles" ON profiles;
CREATE POLICY "Self update profiles" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Agents all leads" ON leads;
CREATE POLICY "Agents all leads" ON leads FOR ALL USING (auth.uid() = agent_id);

DROP POLICY IF EXISTS "Users all sims" ON saved_simulations;
CREATE POLICY "Users all sims" ON saved_simulations FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public Storage" ON storage.objects;
CREATE POLICY "Public Storage" ON storage.objects FOR SELECT USING (bucket_id IN ('avatars', 'covers'));
DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Owner Update" ON storage.objects;
CREATE POLICY "Owner Update" ON storage.objects FOR UPDATE USING (auth.uid() = owner);


-- 5. GATILHOS E FUNÇÕES (TRIGGERS)

-- Função para atualizar timestamp 'updated_at'
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_leads_modtime ON leads;
CREATE TRIGGER update_leads_modtime BEFORE UPDATE ON leads FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_profiles_modtime ON profiles;
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Função para criar perfil automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário'), COALESCE(new.raw_user_meta_data->>'user_type', 'CLIENTE'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;

type ViewType = 'CALCULATOR' | 'DASHBOARD' | 'PROFILE';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('CALCULATOR');
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  
  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Mobile specific state
  const [mobileSimView, setMobileSimView] = useState<'FORM' | 'RESULT'>('FORM');
  
  // -- Data State --
  const [data, setData] = useState<SimulationData>({
    propertyValue: 500000,
    downPayment: 100000,
    interestRateAnnual: 11.63,
    termYears: 30,
    amortizationSystem: 'SAC',
    monthlyIncome: 15000,
    maxIncomeCommitment: 30,
    extraAmortizationMonthly: 0,
    extraAmortizationStrategy: 'REDUCE_TERM'
  });

  // -- Flow State --
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  const resultRef = useRef<HTMLDivElement>(null);

  // Check Configuration and Initialize Supabase Session
  useEffect(() => {
    const checkConfigAndInit = async () => {
      // 1. Check if keys are present
      if (!isSupabaseConfigured()) {
        setIsConfigured(false);
        setIsLoadingSession(false);
        return;
      }

      // 2. Init Session & Check DB
      try {
        const currentUser = await getStoredUser();
        
        // CHECK PAYMENT SUCCESS URL PARAM
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment_success') === 'true') {
            setShowSuccessModal(true);
            // Optimistically update user to PRO if not already
            if (currentUser && currentUser.plan !== 'PRO') {
                const updatedUser = { ...currentUser, plan: 'PRO' as const };
                setUser(updatedUser);
                // Try to update on server (webhook usually handles this, but redundancy helps)
                updateUserProfile(updatedUser);
            }
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        // DB CHECK: Try to access profiles table to see if it exists
        const { error: dbCheckError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        
        if (dbCheckError && (dbCheckError.code === '42P01' || dbCheckError.message.includes('does not exist'))) {
           setDbError(true);
           setIsLoadingSession(false);
           return;
        }

        if (currentUser) {
          setUser(prev => prev?.plan === 'PRO' ? prev : currentUser); // Keep optimistic PRO if set above
          if (currentUser.type === 'CORRETOR') {
             setCurrentView('DASHBOARD');
          }
        }
      } catch (e) {
        console.error("Session/DB error", e);
      } finally {
        setIsLoadingSession(false);
      }
    };

    checkConfigAndInit();

    // Listen for auth changes only if configured
    if (isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setCurrentView('CALCULATOR');
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setResult(null);
    setCurrentView('CALCULATOR');
  };

  const handleUpgrade = async () => {
    if (!user) return;
    setIsProcessingUpgrade(true);

    // Tenta iniciar o checkout do Stripe
    const result = await subscribeToPro(user.email, user.id);

    // Se houve erro no backend (ou backend não existe), usamos o fallback simulado
    if (result && result.simulated) {
        const updatedUser: UserProfile = { ...user, plan: 'PRO' };
        setUser(updatedUser);
        await updateUserProfile(updatedUser);
        setShowLimitModal(false);
        setShowSuccessModal(true); // Re-use the success modal
    }
    
    setIsProcessingUpgrade(false);
  };

  const handleBankSelect = (rate: number) => {
    setData(prev => ({ ...prev, interestRateAnnual: rate }));
    
    // Feedback visual opcional
    const formElement = document.getElementById('calc-form-container');
    if (formElement) {
       formElement.classList.add('ring-2', 'ring-blue-400');
       setTimeout(() => formElement.classList.remove('ring-2', 'ring-blue-400'), 500);
    }
  };

  const handleSimulate = async () => {
    if (!user) return;

    if (user.plan === 'FREE' && user.simulationsCount >= 5) {
        setShowLimitModal(true);
        return;
    }

    try {
      const res = calculateSimulation(data);
      
      // Update count in Supabase
      const newCount = user.simulationsCount + 1;
      const updatedUser = { ...user, simulationsCount: newCount };
      setUser(updatedUser);
      updateUserProfile(updatedUser);

      if (user?.type === 'CLIENTE') {
         // Save COMPLETE data to Supabase DB
         const { error } = await supabase.from('saved_simulations').insert({
             user_id: user.id,
             property_value: data.propertyValue,
             down_payment: data.downPayment,
             term_years: data.termYears,
             monthly_payment: res.firstInstallment,
             interest_rate_annual: data.interestRateAnnual,
             amortization_system: data.amortizationSystem,
             monthly_income: data.monthlyIncome
         });

         if (error) {
             console.error("Erro ao salvar histórico:", error);
             alert("Atenção: Não foi possível salvar o histórico. Verifique se o script SQL foi atualizado no Supabase.");
         }
         
         finalizeSimulation(res);
      } else {
         finalizeSimulation(res);
      }
    } catch (error) {
      console.error("Simulation error:", error);
      alert("Erro ao calcular simulação. Verifique os dados inseridos.");
    }
  };

  // Carregar Simulação Histórica (Cliente)
  const handleLoadSimulation = (sim: SavedSimulation) => {
    const loadedData: SimulationData = {
      propertyValue: sim.propertyValue,
      downPayment: sim.downPayment,
      interestRateAnnual: sim.interestRate,
      termYears: sim.termYears,
      amortizationSystem: sim.amortizationSystem,
      monthlyIncome: sim.monthlyIncome,
      maxIncomeCommitment: 30,
      extraAmortizationMonthly: 0,
      extraAmortizationStrategy: 'REDUCE_TERM'
    };

    setData(loadedData);
    const res = calculateSimulation(loadedData);
    setResult(res);
    
    setCurrentView('CALCULATOR');
    setMobileSimView('RESULT');

    setTimeout(() => {
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Carregar Lead para Simulação (Corretor)
  const handleLoadLeadSimulation = (lead: LeadData) => {
      let simulationToLoad: SimulationData;

      if (lead.simulationData) {
          simulationToLoad = lead.simulationData;
      } else {
          // Fallback robusto para leads sem dados completos
          // Tenta extrair o valor da string de interesse (ex: "R$ 500.000,00")
          const value = parseCurrency(lead.interest) || 0;
          simulationToLoad = {
              propertyValue: value,
              downPayment: value * 0.2, // Padrão 20%
              interestRateAnnual: 11.63, // Padrão Mercado
              termYears: 30,
              amortizationSystem: 'SAC',
              monthlyIncome: 0,
              maxIncomeCommitment: 30,
              extraAmortizationMonthly: 0,
              extraAmortizationStrategy: 'REDUCE_TERM'
          };
      }
      
      setData(simulationToLoad);
      setCurrentView('CALCULATOR');
      
      if (lead.simulationData) {
          // Se tem dados completos, vai direto para o resultado
          const res = calculateSimulation(simulationToLoad);
          setResult(res);
          setMobileSimView('RESULT');
      } else {
          // Se é dados parciais, vai para o formulário para completar
          setResult(null);
          setMobileSimView('FORM');
      }

      // Garante scroll suave para o topo
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLeadSubmit = async (leadInput: { name: string; email: string; phone: string }) => {
    if (!user) return;
    
    try {
        await supabase.from('leads').insert({
            agent_id: user.id,
            name: leadInput.name,
            email: leadInput.email,
            phone: leadInput.phone,
            interest: formatCurrency(data.propertyValue),
            status: 'NOVO',
            simulation_data: data // Saving full simulation JSON
        });
        
        setShowLeadModal(false);
        alert("Lead salvo com sucesso no seu painel!");
    } catch (e) {
        console.error("Error saving lead", e);
        alert("Erro ao salvar lead.");
    }
  };

  const finalizeSimulation = (res: CalculationResult) => {
    setResult(res);
    setCurrentView('CALCULATOR');
    setMobileSimView('RESULT');
    
    setTimeout(() => {
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(REQUIRED_SQL_SCRIPT);
    alert("Script SQL copiado! Cole no Editor SQL do Supabase.");
  };

  // --- RENDER STATES ---

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
           <div className="bg-blue-600 p-8 text-center text-white">
             <Settings className="w-12 h-12 mx-auto mb-4 opacity-80" />
             <h1 className="text-2xl font-bold mb-2">Configuração do Supabase</h1>
             <p className="opacity-90">O aplicativo precisa ser conectado ao seu projeto.</p>
           </div>
           
           <div className="p-8 space-y-6">
             <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex items-start gap-3">
                 <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                 <div>
                    <strong>Atenção:</strong> O token "sbp_..." que você tem é um <em>Personal Access Token</em>.
                    Ele <strong>não deve</strong> ser usado aqui. O front-end precisa das chaves públicas do projeto.
                 </div>
             </div>

             <div>
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Key className="w-4 h-4 text-blue-600" />
                    Como encontrar as chaves corretas:
                </h3>
                <ol className="list-decimal list-inside text-slate-600 text-sm space-y-2 ml-1">
                    <li>Acesse seu projeto no <a href="https://supabase.com/dashboard" target="_blank" className="text-blue-600 hover:underline">Supabase Dashboard</a>.</li>
                    <li>Vá em <strong>Settings</strong> (Ícone de engrenagem) {'>'} <strong>API</strong>.</li>
                    <li>Copie o <strong>Project URL</strong> e adicione no arquivo <code>.env</code> como <code>VITE_SUPABASE_URL</code>.</li>
                    <li>Copie a chave <strong>anon</strong> (Public) e adicione no <code>.env</code> como <code>VITE_SUPABASE_ANON_KEY</code>.</li>
                </ol>
             </div>

             <div className="pt-2 text-center text-xs text-slate-400">
                Reinicie a aplicação após adicionar as variáveis de ambiente.
             </div>
           </div>
        </div>
      </div>
    );
  }

  // DATABASE MISSING ERROR SCREEN
  if (dbError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up border border-slate-200">
           
           <div className="bg-amber-500 p-6 md:p-8 text-white flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                 <Database className="w-8 h-8" />
              </div>
              <div>
                 <h1 className="text-2xl font-bold">Banco de Dados não Encontrado</h1>
                 <p className="opacity-90">Não encontramos as tabelas necessárias no seu Supabase.</p>
              </div>
           </div>
           
           <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-start gap-4">
                 <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold flex-shrink-0 mt-1">1</div>
                 <div className="flex-1">
                    <h3 className="font-bold text-slate-800">Acesse o Editor SQL</h3>
                    <p className="text-slate-500 text-sm mt-1">
                       No painel do Supabase, clique no ícone "SQL Editor" na barra lateral esquerda.
                    </p>
                 </div>
              </div>

              <div className="flex items-start gap-4">
                 <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold flex-shrink-0 mt-1">2</div>
                 <div className="flex-1">
                    <h3 className="font-bold text-slate-800">Rode o Script de Configuração</h3>
                    <p className="text-slate-500 text-sm mt-1 mb-3">
                       Copie o código abaixo e cole no editor. Depois clique em "Run".
                    </p>
                    
                    <div className="relative group">
                      <div className="absolute right-2 top-2 z-10">
                         <button 
                           onClick={copyToClipboard}
                           className="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border border-white/20 transition-all"
                         >
                            <Copy className="w-3 h-3" /> Copiar Código
                         </button>
                      </div>
                      <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs overflow-auto max-h-64 border border-slate-800 font-mono leading-relaxed">
                        {REQUIRED_SQL_SCRIPT}
                      </pre>
                    </div>
                 </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                 <button 
                   onClick={() => window.location.reload()}
                   className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-600/20 flex items-center gap-2"
                 >
                   <CheckCircle className="w-5 h-5" />
                   Já criei as tabelas, verificar novamente
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (isLoadingSession) {
      return (
          <div className="h-screen flex items-center justify-center bg-slate-50">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  // Auth View
  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // Main Application
  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Top Bar (Simplified & Compact for Mobile) */}
      <header className="bg-white border-b border-slate-200 h-14 md:h-16 flex items-center justify-between px-3 md:px-6 flex-shrink-0 z-20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('DASHBOARD')}>
          <div className="bg-blue-600 p-1 md:p-1.5 rounded-lg">
            <Layout className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <span className="font-bold text-base md:text-lg text-slate-900 tracking-tight">Finan<span className="text-blue-600">Smart</span></span>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex bg-slate-100 p-1 rounded-lg">
            <button 
                onClick={() => setCurrentView('CALCULATOR')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'CALCULATOR' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <CalcIcon className="w-4 h-4" />
                <span>Simulador</span>
            </button>
            <button 
                onClick={() => setCurrentView('DASHBOARD')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'DASHBOARD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <LayoutDashboard className="w-4 h-4" />
                <span>Painel</span>
            </button>
        </div>
        
        {/* User Profile Access */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
             <span className="text-[10px] text-slate-400 uppercase font-bold">Simulações</span>
             <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold ${user.plan === 'FREE' && user.simulationsCount >= 5 ? 'text-red-500' : 'text-slate-700'}`}>
                    {user.plan === 'FREE' ? `${Math.min(user.simulationsCount, 5)} de 5` : 'Ilimitado'}
                </span>
                {user.plan === 'PRO' && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
             </div>
          </div>

          <button 
            onClick={() => setCurrentView('PROFILE')}
            className="flex items-center gap-3 hover:bg-slate-50 p-1 pr-3 rounded-full transition-colors group"
          >
             <div className="text-right hidden md:block">
                 <p className="text-sm font-bold text-slate-700 leading-none group-hover:text-blue-600 transition-colors">{user.name}</p>
                 <p className="text-[10px] text-slate-400 uppercase font-semibold">{user.type}</p>
             </div>
             {user.avatarUrl ? (
                 <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-slate-100 group-hover:border-blue-200 object-cover" />
             ) : (
                <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-bold text-white text-xs bg-blue-500`}>
                    {user.name[0]}
                </div>
             )}
          </button>
          
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors p-2 hidden md:block">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Internal API Mock: Bank Rates Carousel (Only on Calculator View) */}
      {currentView === 'CALCULATOR' && <BankCarousel onSelect={handleBankSelect} />}

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
          
          {/* PROFILE VIEW */}
          {currentView === 'PROFILE' && (
             <div className="h-full overflow-y-auto bg-slate-50">
                <UserProfilePanel 
                  user={user} 
                  onUpdate={setUser} 
                  onLogout={handleLogout} 
                  onUpgrade={handleUpgrade}
                />
             </div>
          )}

          {/* DASHBOARD VIEW */}
          {currentView === 'DASHBOARD' && (
              <div className="h-full overflow-y-auto bg-slate-50 pb-16 md:pb-0">
                  {user.type === 'CORRETOR' ? (
                      <AgentDashboard 
                        user={user} 
                        onSelectLead={handleLoadLeadSimulation}
                      />
                  ) : (
                      <ClientDashboard 
                        user={user} 
                        onNewSimulation={() => setCurrentView('CALCULATOR')} 
                        onSelectSimulation={handleLoadSimulation}
                      />
                  )}
              </div>
          )}

          {/* CALCULATOR VIEW */}
          {currentView === 'CALCULATOR' && (
             <div className="h-full flex flex-col md:flex-row pb-12 md:pb-0">
                
                {/* Mobile Tab Toggle */}
                <div className="md:hidden flex-shrink-0 px-3 py-2 bg-white border-b border-slate-200 flex gap-2">
                    <button 
                      onClick={() => setMobileSimView('FORM')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${mobileSimView === 'FORM' ? 'bg-slate-100 text-blue-600 ring-1 ring-blue-600/10' : 'text-slate-500'}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Dados
                    </button>
                    <button 
                      onClick={() => setMobileSimView('RESULT')}
                      disabled={!result}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${mobileSimView === 'RESULT' ? 'bg-slate-100 text-blue-600 ring-1 ring-blue-600/10' : 'text-slate-500'} ${!result ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <PieChart className="w-3.5 h-3.5" /> Resultado
                    </button>
                </div>

                {/* Left Sidebar: Inputs */}
                <aside 
                    id="calc-form-container"
                    className={`w-full md:w-[400px] bg-white border-r border-slate-200 z-10 flex-col overflow-hidden md:flex-shrink-0 transition-all ${mobileSimView === 'FORM' ? 'flex flex-1' : 'hidden md:flex md:h-full'}`}
                >
                    <CalculatorForm 
                        data={data} 
                        onChange={setData} 
                        onSimulate={handleSimulate} 
                    />
                </aside>

                {/* Right Content: Results */}
                <section 
                  ref={resultRef}
                  className={`bg-slate-50 overflow-y-auto relative ${mobileSimView === 'RESULT' ? 'block flex-1' : 'hidden md:block md:flex-1 md:h-full'}`}
                >
                    {result ? (
                        <ResultDashboard 
                          data={data} 
                          result={result} 
                          user={user} 
                          onSaveLead={() => setShowLeadModal(true)}
                          onUpgradeClick={handleUpgrade}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center animate-fade-in">
                          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                              <CalcIcon className="w-10 h-10 text-blue-200" />
                          </div>
                          <h2 className="text-xl font-bold text-slate-600 mb-2">Novo Cálculo</h2>
                          <p className="max-w-md text-sm text-slate-400">
                              Preencha os dados {window.innerWidth < 768 ? 'na aba "Dados"' : 'à esquerda'} para gerar uma análise financeira detalhada.
                          </p>
                          <button 
                            onClick={() => setMobileSimView('FORM')}
                            className="md:hidden mt-6 bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-blue-600/20 text-sm"
                          >
                            Preencher Dados
                          </button>
                        </div>
                    )}
                </section>
             </div>
          )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-1.5 flex justify-around items-center z-30 shadow-lg pb-safe">
        <button 
          onClick={() => setCurrentView('CALCULATOR')}
          className={`flex flex-col items-center gap-0.5 p-1.5 transition-colors ${currentView === 'CALCULATOR' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <CalcIcon className={`w-5 h-5 ${currentView === 'CALCULATOR' ? 'fill-current' : ''}`} />
          <span className="text-[9px] font-medium">Simulador</span>
        </button>
        
        <button 
          onClick={() => setCurrentView('DASHBOARD')}
          className={`flex flex-col items-center gap-0.5 p-1.5 transition-colors ${currentView === 'DASHBOARD' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <LayoutDashboard className={`w-5 h-5 ${currentView === 'DASHBOARD' ? 'fill-current' : ''}`} />
          <span className="text-[9px] font-medium">Início</span>
        </button>
        
        <button 
          onClick={() => setCurrentView('PROFILE')}
          className={`flex flex-col items-center gap-0.5 p-1.5 transition-colors ${currentView === 'PROFILE' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <UserCircle className={`w-5 h-5 ${currentView === 'PROFILE' ? 'fill-current' : ''}`} />
          <span className="text-[9px] font-medium">Perfil</span>
        </button>
      </nav>
      
      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 10px); }
      `}</style>
      
      <LeadModal 
        isOpen={showLeadModal} 
        onClose={() => setShowLeadModal(false)}
        onSubmit={handleLeadSubmit}
      />

      {showLimitModal && (
        <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-scale-in border-4 border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-pink-500"></div>
            
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
               <Lock className="w-8 h-8 text-red-500" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3">Limite Atingido</h3>
            
            <p className="text-slate-600 mb-6 text-sm leading-relaxed px-2">
              Você atingiu o limite de <strong>5 simulações gratuitas</strong>.
            </p>
            
            <div className="space-y-3">
               <button 
                onClick={handleUpgrade}
                disabled={isProcessingUpgrade}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                 {isProcessingUpgrade ? (
                     <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                 ) : 'Assinar Agora'}
               </button>
               <button 
                onClick={() => setShowLimitModal(false)}
                className="w-full text-slate-400 font-bold py-2 hover:text-slate-600 transition-colors text-sm"
               >
                 Voltar
               </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL (PAYMENT CONFIRMED) */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-scale-in border-4 border-white/10 relative overflow-hidden">
             {/* Confetti Effect Background (Simplified CSS) */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                <div className="absolute top-10 right-1/4 w-3 h-3 bg-blue-500 rounded-full animate-ping delay-100"></div>
                <div className="absolute bottom-10 left-1/2 w-2 h-2 bg-yellow-500 rounded-full animate-ping delay-200"></div>
             </div>

             <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg shadow-emerald-200">
                <Sparkles className="w-10 h-10 text-emerald-600 animate-pulse" />
             </div>
             
             <h3 className="text-2xl font-bold text-slate-900 mb-2">Pagamento Confirmado!</h3>
             <p className="text-slate-600 mb-8 leading-relaxed">
               Parabéns! Sua conta foi atualizada para o plano <strong>PRO</strong>. Aproveite todos os recursos ilimitados.
             </p>
             
             <button 
               onClick={() => setShowSuccessModal(false)}
               className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 transform hover:-translate-y-1 flex items-center justify-center gap-2"
             >
               <Check className="w-5 h-5" />
               Começar a Usar
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
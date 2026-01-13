import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Layout, LogOut, LayoutDashboard, Calculator as CalcIcon, UserCircle, Star, Settings, Database, AlertTriangle, CheckCircle, Copy, Edit3, PieChart, Key } from 'lucide-react';
import { toast } from 'sonner';

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
import PaywallModal from './components/PaywallModal';
import LandingPage from './components/LandingPage';

// --- SQL SCRIPT (Preserved) ---
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
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS simulations_count int DEFAULT 0;

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

// --- COMPONENT ---

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- GLOBAL DATA STATE ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const [dbError, setDbError] = useState(false);

  // Simulation state (Shared across routes for simplicity)
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

  const [result, setResult] = useState<CalculationResult | null>(null);

  // Mobile View State
  const [mobileSimView, setMobileSimView] = useState<'FORM' | 'RESULT'>('FORM');
  const resultRef = useRef<HTMLDivElement>(null);
  const [showLeadModal, setShowLeadModal] = useState(false); // For Reator saving leads
  const [showLimitModal, setShowLimitModal] = useState(false); // For Free plan limit

  // --- EFFECT: INIT & AUTH ---
  useEffect(() => {
    const checkConfigAndInit = async () => {
      if (!isSupabaseConfigured()) {
        setIsConfigured(false);
        setIsLoadingSession(false);
        return;
      }

      try {
        const currentUser = await getStoredUser();

        // CHECK PAYMENT SUCCESS
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment_success') === 'true') {
          toast.success("Pagamento confirmado! Plano PRO ativado.");
          if (currentUser && currentUser.plan !== 'PRO') {
            const updatedUser = { ...currentUser, plan: 'PRO' as const };
            setUser(updatedUser);
            updateUserProfile(updatedUser);
          }
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        // DB HEALTH CHECK
        const { error: dbCheckError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        if (dbCheckError && (dbCheckError.code === '42P01' || dbCheckError.message.includes('does not exist'))) {
          setDbError(true);
          setIsLoadingSession(false);
          return;
        }

        if (currentUser) {
          setUser(currentUser);
        }
      } catch (e) {
        console.error("Session/DB error", e);
      } finally {
        setIsLoadingSession(false);
      }
    };

    checkConfigAndInit();

    if (isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setResult(null);
          navigate('/login');
        }
      });
      return () => { authListener.subscription.unsubscribe(); };
    }
  }, [navigate]);

  // --- ACTIONS ---

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
    toast.success(`Bem-vindo, ${newUser.name}!`);
    // Navigate to where they were coming from, or dashboard
    const origin = (location.state as any)?.from?.pathname || '/dashboard';
    navigate(origin);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setResult(null);
    toast.info("Desconectado com sucesso.");
    navigate('/');
  };

  const handleUpgrade = async () => {
    if (!user) return navigate('/login');

    // Simulating Upgrade
    toast.info("Iniciando checkout...");
    const result = await subscribeToPro(user.email, user.id);

    if (result && result.simulated) {
      const updatedUser: UserProfile = { ...user, plan: 'PRO' };
      setUser(updatedUser);
      await updateUserProfile(updatedUser);
      toast.success("Upgrade realizado com sucesso!");
    }
  };

  const handleSimulate = async () => {
    // 1. Strict Requirement Check: 5 simulations Limit for Free Plan
    if (user?.plan === 'FREE' && user.simulationsCount >= 5) {
      setShowLimitModal(true);
      return; // BLOCK EXECUTION
    }

    // Guest can simulate freely!
    // But if they want to save, they need to log in.
    // We calculate first.
    try {
      const res = calculateSimulation(data);
      setResult(res);
      setMobileSimView('RESULT');

      // Auto scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

      // If user is logged in, we update their usage count
      if (user) {
        // Limit checked at start of function
        const newCount = user.simulationsCount + 1;
        const updatedUser = { ...user, simulationsCount: newCount };
        setUser(updatedUser);
        updateUserProfile(updatedUser);

        // If it's a CLIENT, auto-save to history
        if (user.type === 'CLIENTE') {
          await supabase.from('saved_simulations').insert({
            user_id: user.id,
            property_value: data.propertyValue,
            down_payment: data.downPayment,
            term_years: data.termYears,
            monthly_payment: res.firstInstallment,
            interest_rate_annual: data.interestRateAnnual,
            amortization_system: data.amortizationSystem,
            monthly_income: data.monthlyIncome
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao calcular. Verifique os valores.");
    }
  };

  const handleSaveLead = async (leadInput?: any) => {
    if (!user) {
      toast.warning("Faça login para salvar este cliente.");
      navigate('/login', { state: { from: location } });
      return;
    }
    // If Realtor trying to save lead from ResultDashboard
    setShowLeadModal(true);
  };

  // --- SUB-COMPONENTS FOR ROUTING ---

  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    if (isLoadingSession) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    return children;
  };

  // --- RENDER HELPERS ---

  if (!isConfigured) return <ConfigErrorScreen />;
  if (dbError) return <DbErrorScreen sql={REQUIRED_SQL_SCRIPT} />;

  const isLanding = location.pathname === '/';

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* --- HEADER - Premium Glassmorphism --- */}
      {!isLanding && (
        <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 h-14 md:h-16 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-40 relative">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="premium-gradient p-1.5 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Layout className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="font-black text-lg md:text-xl text-slate-900 tracking-tighter">Finan<span className="text-blue-600">Smart</span></span>
          </div>

          {/* Desktop Nav - Pill Style */}
          <div className="hidden md:flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/50">
            <button
              onClick={() => navigate('/simulador')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${location.pathname === '/simulador' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            >
              <CalcIcon className="w-3.5 h-3.5" /> <span>Simulador</span>
            </button>
            {user && (
              <button
                onClick={() => navigate('/dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${location.pathname === '/dashboard' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> <span>Painel</span>
              </button>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Usuário {user.plan}</span>
                  <div className="flex items-center gap-1.5">
                    {user.plan === 'PRO' && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    <span className="text-sm font-black text-slate-900">{user.name}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                >
                  {user.name[0]}
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
              >
                Entrar
              </button>
            )}
          </div>
        </header>
      )}


      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-hidden relative">
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Public Simulator */}
          <Route path="/simulador" element={
            <div className="h-full flex flex-col md:flex-row pb-16 md:pb-0 relative">

              <aside className={`w-full md:w-[450px] bg-white z-10 flex-col overflow-hidden transition-all relative border-r border-slate-200/50 ${mobileSimView === 'FORM' ? 'flex flex-1 h-full' : 'hidden md:flex md:h-full'}`}>
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>
                <BankCarousel onSelect={(rate) => { setData(prev => ({ ...prev, interestRateAnnual: rate })); toast.success("Taxa aplicada!"); }} />
                <div className="flex-1 overflow-hidden relative z-10">
                  <CalculatorForm data={data} onChange={setData} onSimulate={handleSimulate} />
                </div>
              </aside>

              <section ref={resultRef} className={`bg-slate-50/50 backdrop-blur-sm overflow-y-auto relative custom-scrollbar ${mobileSimView === 'RESULT' ? 'block flex-1 h-full' : 'hidden md:block md:flex-1 md:h-full'}`}>
                {/* Decorative background element */}
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

                {result ? (
                  <ResultDashboard
                    data={data}
                    result={result}
                    user={user || { name: 'Visitante', email: '', type: 'CLIENTE', id: 'guest', plan: 'FREE', simulationsCount: 0 } as any} // Mock user for guest
                    onSaveLead={handleSaveLead}
                    onUpgradeClick={user ? handleUpgrade : () => navigate('/login')}
                  />
                ) : (
                  <EmptyState />
                )}
              </section>

              <PaywallModal
                isOpen={showLimitModal}
                onClose={() => setShowLimitModal(false)}
                onUpgrade={handleUpgrade}
                title="Limite de Simulações Atingido"
                description="Você usou suas 5 simulações gratuitas. Para continuar simulando ilimitadamente, assine o plano PRO."
              />



              {/* Mobile Bottom Tabs - Glassy */}
              <div className="md:hidden fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white/50 flex z-50 h-20 shadow-2xl overflow-hidden ring-1 ring-black/5">
                <button
                  onClick={() => setMobileSimView('FORM')}
                  className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all ${mobileSimView === 'FORM' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <CalcIcon className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Simular</span>
                </button>
                <div className="w-px h-10 bg-slate-200 self-center"></div>
                <button
                  onClick={() => setMobileSimView('RESULT')}
                  className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all ${mobileSimView === 'RESULT' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <PieChart className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Resultado</span>
                </button>
              </div>


            </div>
          } />

          {/* Auth */}
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthScreen onLogin={handleLogin} />} />

          {/* Protected Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div className="h-full overflow-y-auto bg-slate-50 pb-16 md:pb-0">
                {user?.type === 'CORRETOR' ? (
                  <AgentDashboard
                    user={user}
                    onSelectLead={(lead) => {
                      toast.info("Carregando simulação...");
                      // Handling state passing via navigate
                      navigate('/simulador', { state: { loadLead: lead } });
                    }}
                  />
                ) : (
                  <ClientDashboard
                    user={user!}
                    onNewSimulation={() => navigate('/simulador')}
                    onSelectSimulation={(sim) => {
                      navigate('/simulador', { state: { loadSim: sim } });
                    }}
                  />
                )}
              </div>
            </ProtectedRoute>
          } />

          {/* Protected Profile */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfilePanel user={user!} onUpdate={setUser} onLogout={handleLogout} onUpgrade={handleUpgrade} />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {/* Leads Modal (Shared) */}
      {
        showLeadModal && user && (
          <LeadModal
            isOpen={showLeadModal}
            onClose={() => setShowLeadModal(false)}
            onSubmit={async (leadInfo) => {
              try {
                await supabase.from('leads').insert({
                  agent_id: user.id,
                  name: leadInfo.name,
                  email: leadInfo.email,
                  phone: leadInfo.phone,
                  interest: formatCurrency(data.propertyValue),
                  status: 'NOVO',
                  simulation_data: data
                });
                toast.success("Lead salvo com sucesso!");
                setShowLeadModal(false);
              } catch (e) { toast.error("Erro ao salvar lead."); }
            }}
          />
        )
      }
    </div >
  );
};

// --- MOCK SCREENS ---

const EmptyState = () => (
  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center animate-fade-in">
    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
      <CalcIcon className="w-10 h-10 text-blue-200" />
    </div>
    <h2 className="text-xl font-bold text-slate-600 mb-2">Simulador FinanSmart</h2>
    <p className="max-w-md text-sm text-slate-400">
      Experimente diferentes cenários de financiamento e amortização.
    </p>
  </div>
);

const ConfigErrorScreen = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <div className="bg-white p-8 rounded-2xl max-w-md text-center">
      <Settings className="w-12 h-12 mx-auto mb-4 text-blue-600" />
      <h1 className="text-xl font-bold">Configuração Pendente</h1>
      <p className="text-slate-500 mt-2">Configure as chaves do Supabase no arquivo .env</p>
    </div>
  </div>
);

const DbErrorScreen = ({ sql }: { sql: string }) => (
  <div className="min-h-screen bg-white p-8 flex flex-col items-center justify-center">
    <Database className="w-16 h-16 text-amber-500 mb-4" />
    <h1 className="text-2xl font-bold text-slate-800">Banco de Dados não Inicializado</h1>
    <p className="text-slate-500 mb-6">Copie o script abaixo e rode no SQL Editor do Supabase.</p>
    <button onClick={() => { navigator.clipboard.writeText(sql); toast.success("Copiado!"); }} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold mb-4">
      Copiar Script SQL
    </button>
  </div>
);

export default App;
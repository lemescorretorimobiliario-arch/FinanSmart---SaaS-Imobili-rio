import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Layout, LogOut, LayoutDashboard, Calculator as CalcIcon, UserCircle, Star, Settings, Database, AlertTriangle, CheckCircle, Copy, Edit3, PieChart, Key } from 'lucide-react';
import { toast } from 'sonner';

import { SimulationData, CalculationResult, UserProfile, LeadData, SavedSimulation, MAX_FREE_SIMULATIONS } from './types';
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
import OnboardingScreen from './components/OnboardingScreen';
import AdminPanel from './components/AdminPanel';


const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- GLOBAL DATA STATE ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isConfigured] = useState(isSupabaseConfigured());
  const [dbError, setDbError] = useState(false);

  // Simulation state (Shared across routes for simplicity)
  const [data, setData] = useState<SimulationData>({
    propertyValue: 500000,
    downPayment: 100000,
    termYears: 30,
    interestRateAnnual: 11.0,
    amortizationSystem: 'SAC',
    monthlyIncome: 12000,
    maxIncomeCommitment: 30,
    extraAmortizationMonthly: 0,
    extraAmortizationStrategy: 'REDUCE_TERM'
  });

  const [result, setResult] = useState<CalculationResult | null>(null);

  // Mobile View State
  const [mobileSimView, setMobileSimView] = useState<'INPUT' | 'RESULT'>('INPUT');
  const resultRef = useRef<HTMLDivElement>(null);
  const [showLeadModal, setShowLeadModal] = useState(false); // For Reator saving leads
  const [showLimitModal, setShowLimitModal] = useState(false); // For Free plan limit
  const [isSimulating, setIsSimulating] = useState(false);

  // --- EFFECT: INIT & AUTH ---
  useEffect(() => {
    const checkConfigAndInit = async () => {
      if (!isSupabaseConfigured()) {
        setIsLoadingSession(false);
        return;
      }

      try {
        const currentUser = await getStoredUser();

        // CHECK PAYMENT SUCCESS
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment_success') === 'true') {
          if (currentUser && currentUser.plan !== 'PRO') {
            const updatedUser = { ...currentUser, plan: 'PRO' as const };
            try {
              await updateUserProfile(updatedUser);
              setUser(updatedUser);
              toast.success("Pagamento confirmado! Plano PRO ativado.");
            } catch (err) {
              console.error("Failed to update plan status", err);
              toast.error("Pagamento processado, mas houve um erro ao atualizar seu status. Recarregue a página.");
            }
          } else {
            toast.success("Bem-vindo de volta! Seu plano PRO está ativo.");
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
          // TRIGGER LIMIT MODAL ON ENTRY IF ZEROTED
          if (currentUser.plan === 'FREE' && currentUser.simulationsCount >= MAX_FREE_SIMULATIONS) {
            setShowLimitModal(true);
          }
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

  // MANDATORY ONBOARDING REDIRECT
  useEffect(() => {
    if (!isLoadingSession && user && !user.setupCompleted && location.pathname !== '/onboarding') {
      navigate('/onboarding', { replace: true });
    }
  }, [user, location.pathname, isLoadingSession, navigate]);

  // --- EFFECT: HANDLE NAVIGATION STATE (Load History/Lead) ---
  useEffect(() => {
    const state = location.state as any;
    if (state?.loadSim) {
      const sim = state.loadSim;
      const loadedData: SimulationData = {
        propertyValue: sim.propertyValue,
        downPayment: sim.downPayment,
        interestRateAnnual: sim.interestRate,
        termYears: sim.termYears,
        amortizationSystem: sim.amortizationSystem,
        monthlyIncome: sim.monthlyIncome,
        maxIncomeCommitment: 30
      };
      setData(loadedData);

      // Auto-calculate
      try {
        const res = calculateSimulation(loadedData);
        setResult(res);
        setMobileSimView('RESULT');
      } catch (err) {
        console.error("Error loading simulation", err);
      }

      // Clear state to avoid re-triggering on future renders if not navigating
      window.history.replaceState({}, document.title);
    } else if (state?.loadLead) {
      const lead = state.loadLead;
      const simData = lead.simulation_data || lead.simulationData;
      if (simData) {
        setData(simData);
        try {
          const res = calculateSimulation(simData);
          setResult(res);
          setMobileSimView('RESULT');
        } catch (err) {
          console.error("Error loading lead simulation", err);
        }
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // --- ACTIONS ---

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
    toast.success(`Bem - vindo, ${newUser.name} !`);
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
    await subscribeToPro(user.email, user.id);
  };

  const handleSimulate = async () => {
    if (user?.plan === 'FREE' && user.simulationsCount >= MAX_FREE_SIMULATIONS) {
      setShowLimitModal(true);
      return;
    }

    setIsSimulating(true);
    try {
      const res = calculateSimulation(data);
      setResult(res);
      setMobileSimView('RESULT');

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

      if (user) {
        const newCount = user.simulationsCount + 1;
        const updatedUser = { ...user, simulationsCount: newCount };

        // Attempting to sync both
        const [profileRes, historyRes] = await Promise.allSettled([
          updateUserProfile(updatedUser),
          supabase.from('saved_simulations').insert({
            user_id: user.id,
            property_value: data.propertyValue,
            down_payment: data.downPayment,
            term_years: data.termYears,
            monthly_payment: res.firstInstallment,
            interest_rate_annual: data.interestRateAnnual,
            amortization_system: data.amortizationSystem,
            monthly_income: data.monthlyIncome
          })
        ]);

        if (profileRes.status === 'fulfilled') {
          setUser(updatedUser);
        }

        if (historyRes.status === 'rejected') {
          console.error("History save failed:", historyRes.reason);
          toast.error("Resultado gerado, mas não pôde ser salvo no histórico.");
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error(`Erro ao calcular: ${error.message || 'Verifique os valores'} `);
    } finally {
      setIsSimulating(false);
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

    // Check if onboarding is needed (especially for Google logins)
    if (!user.setupCompleted && location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }

    return children;
  };

  // --- RENDER HELPERS ---

  if (!isConfigured) return <ConfigErrorScreen />;
  if (dbError) return <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
    <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
    <h1 className="text-xl font-bold">Erro de Conexão</h1>
    <p className="text-slate-500 mt-2">Não foi possível conectar ao banco de dados.</p>
    <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl">Tentar Novamente</button>
  </div>;

  const isLanding = location.pathname === '/';
  const isOnboarding = location.pathname === '/onboarding';

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* --- HEADER - Premium Glassmorphism --- */}
      {!isLanding && (
        <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 h-14 md:h-16 flex items-center justify-between px-3 md:px-6 flex-shrink-0 z-40 relative">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="premium-gradient p-1.5 rounded-lg shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Layout className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-base md:text-lg text-slate-900 tracking-tighter">Finan<span className="text-blue-600">Smart</span></span>
          </div>

          {/* Desktop Nav - Pill Style */}
          {!isOnboarding && (
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
          )}

          {/* CTA UPGRADE - HEADER */}
          {!isOnboarding && user && user.plan === 'FREE' && (
            <button
              onClick={handleUpgrade}
              className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-amber-200 hover:bg-amber-600 hover:text-white transition-all shadow-sm active:scale-95"
            >
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              Assinar Plano PRO
            </button>
          )}

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Usuário {user.plan}</span>
                  <div className="flex items-center gap-1.5">
                    {user.plan === 'PRO' && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    <span className="text-sm font-black text-slate-900">{user.name}</span>
                    {user.plan === 'FREE' && (
                      <span className="ml-1 text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100 font-bold">
                        {user.simulationsCount}/{MAX_FREE_SIMULATIONS}
                      </span>
                    )}
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
      <main className="flex-1 relative overflow-y-auto custom-scrollbar bg-slate-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Public Simulator */}
          <Route path="/simulador" element={
            <div className="h-full flex flex-col md:flex-row pb-16 md:pb-0 relative">

              <aside className={`w-full md:w-[450px] bg-white z-10 flex-col overflow-hidden transition-all relative border-r border-slate-200/50 ${mobileSimView === 'INPUT' ? 'flex flex-1 h-full' : 'hidden md:flex md:h-full'}`}>
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>
                <BankCarousel onSelect={(rate) => { setData(prev => ({ ...prev, interestRateAnnual: rate })); toast.success("Taxa aplicada!"); }} />
                <div className="flex-1 overflow-hidden relative z-10">
                  <CalculatorForm data={data} onChange={setData} onSimulate={handleSimulate} user={user} />
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
                  onClick={() => setMobileSimView('INPUT')}
                  className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all ${mobileSimView === 'INPUT' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600'}`}
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
              {user?.type === 'CORRETOR' ? (
                <AgentDashboard
                  user={user}
                  onSelectLead={(lead) => {
                    toast.info("Carregando simulação...");
                    // Handling state passing via navigate
                    navigate('/simulador', { state: { loadLead: lead } });
                  }}
                  onUpgrade={handleUpgrade}
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
            </ProtectedRoute>
          } />

          {/* Protected Profile */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfilePanel user={user!} onUpdate={setUser} onLogout={handleLogout} onUpgrade={handleUpgrade} />
            </ProtectedRoute>
          } />

          {/* Onboarding */}
          <Route path="/onboarding" element={
            user ? (
              user.setupCompleted ? <Navigate to="/dashboard" /> : <OnboardingScreen user={user} onComplete={setUser} />
            ) : <Navigate to="/login" />
          } />

          {/* Admin Route */}
          <Route path="/admin" element={
            <ProtectedRoute>
              {user?.email?.includes('admin') || user?.email === 'lemes_333@hotmail.com' ? (
                <AdminPanel />
              ) : (
                <div className="py-20 flex items-center justify-center flex-col">
                  <h1 className="text-2xl font-black text-slate-900">Acesso Negado</h1>
                  <p className="text-slate-500">Esta área é restrita para administradores.</p>
                  <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-600 font-bold hover:underline">Voltar</button>
                </div>
              )}
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
                const { error } = await supabase.from('leads').insert({
                  agent_id: user.id,
                  name: leadInfo.name,
                  email: leadInfo.email,
                  phone: leadInfo.phone,
                  interest: formatCurrency(data.propertyValue),
                  status: 'NOVO',
                  simulation_data: data
                });

                if (error) throw error;

                toast.success("Lead salvo com sucesso!");
                setShowLeadModal(false);
              } catch (e: any) {
                console.error("Save Lead Error:", e);
                toast.error(`Erro ao salvar lead: ${e.message || 'Tente novamente.'} `);
              }
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


export default App;
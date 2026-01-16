import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Layout, LogOut, LayoutDashboard, Calculator as CalcIcon, UserCircle, Star, Settings, Database, AlertTriangle, CheckCircle, Copy, Edit3, PieChart, Key } from 'lucide-react';
import { toast } from 'sonner';

import { SimulationData, CalculationResult, UserProfile, LeadData, SavedSimulation } from './types';
import { calculateSimulation, formatCurrency, parseCurrency } from './utils/finance';
import { supabase, isSupabaseConfigured } from './utils/supabaseClient';
import { subscribeToPro } from './utils/stripePayment';

import { useAuth } from './context/AuthContext';
import { simulationService } from './services/simulationService';
import { SYSTEM_LIMITS, canUserSimulate, UserRole, UserPlan } from './core/system';

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
  const { user, loading: isLoadingSession, refreshUser, signOut: authLogout } = useAuth();

  const [isConfigured] = useState(isSupabaseConfigured());
  const [dbError, setDbError] = useState(false);

  // Simulation state
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

  // UI States
  const [mobileSimView, setMobileSimView] = useState<'INPUT' | 'RESULT'>('INPUT');
  const resultRef = useRef<HTMLDivElement>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Sync Payment after redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_success') === 'true' && user) {
      toast.success("Pagamento confirmado! Plano PRO ativado.");
      refreshUser();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  // Mandatory Onboarding Check (Etapa 3)
  useEffect(() => {
    if (!isLoadingSession && user && !user.setupCompleted && location.pathname !== '/onboarding') {
      navigate('/onboarding', { replace: true });
    }
  }, [user, location.pathname, isLoadingSession, navigate]);

  // Handle Simulation (Etapa 4 - Mandatory History)
  const handleSimulate = async () => {
    const simData = data; // Use current state
    // Check Limits First
    if (user && !canUserSimulate(user as any)) {
      setShowLimitModal(true);
      return;
    }

    setIsSimulating(true);
    try {
      const calcResult = calculateSimulation(simData);
      setResult(calcResult);
      setData(simData);

      if (user) {
        try {
          await simulationService.saveSimulation(user.id, simData, calcResult.firstInstallment);
          await refreshUser();
        } catch (e) {
          console.error("Simulation record failed:", e);
        }
      }

      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setMobileSimView('RESULT');
      } else {
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleLogout = async () => {
    await authLogout();
    navigate('/login');
  };

  const handleUpgrade = async () => {
    if (!user) return navigate('/login');
    try {
      await subscribeToPro(user.email, user.id);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // --- SUB-COMPONENTS FOR ROUTING ---

  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    if (isLoadingSession) return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

    if (!user.setupCompleted && location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }

    return children;
  };

  // --- RENDER HELPERS ---

  if (!isConfigured) return <ConfigErrorScreen />;
  if (dbError) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h1 className="text-xl font-bold">Erro de Conexão</h1>
      <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl">Tentar Novamente</button>
    </div>
  );

  const isLanding = location.pathname === '/';
  const isOnboarding = location.pathname === '/onboarding';

  return (
    <div className={`flex flex-col bg-slate-50 font-sans ${isLanding ? 'min-h-screen' : 'h-screen overflow-hidden'}`}>
      {!isLanding && (
        <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 h-12 md:h-14 flex items-center justify-between px-3 md:px-6 flex-shrink-0 z-40 relative">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="premium-gradient p-1.5 rounded-lg shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Layout className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-base md:text-lg text-slate-900 tracking-tighter">Finan<span className="text-blue-600">Smart</span></span>
          </div>

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

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Plano {user.plan}</span>
                  <div className="flex items-center gap-1.5">
                    {user.plan === 'PRO' && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    <span className="text-sm font-black text-slate-900">{user.name}</span>
                    {user.plan === 'FREE' && (
                      <span className="ml-1 text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100 font-bold">
                        {user.simulationsCount}/{SYSTEM_LIMITS.FREE_SIMULATIONS}
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
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
              >
                Entrar
              </button>
            )}
          </div>
        </header>
      )}

      <main className={`flex-1 relative bg-slate-50 ${isLanding ? '' : (location.pathname === '/simulador' ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar')}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/simulador" element={
            <div className="h-full flex flex-col md:flex-row pb-16 md:pb-0 relative">
              <aside className={`w-full md:w-[450px] bg-white z-10 flex-col overflow-hidden transition-all relative border-r border-slate-200/50 ${mobileSimView === 'INPUT' ? 'flex flex-1 h-full' : 'hidden md:flex md:h-full'}`}>
                <BankCarousel onSelect={(rate) => { setData(prev => ({ ...prev, interestRateAnnual: rate })); toast.success("Taxa aplicada!"); }} />
                <div className="flex-1 overflow-hidden relative z-10">
                  <CalculatorForm data={data} onChange={setData} onSimulate={handleSimulate} user={user} />
                </div>
              </aside>

              <section ref={resultRef} className={`bg-slate-50/50 backdrop-blur-sm overflow-y-auto relative custom-scrollbar ${mobileSimView === 'RESULT' ? 'block flex-1 h-full' : 'hidden md:block md:flex-1 md:h-full'}`}>
                {result ? (
                  <ResultDashboard
                    data={data}
                    result={result}
                    user={user || { name: 'Visitante', email: '', type: UserRole.CLIENTE, id: 'guest', plan: UserPlan.FREE, simulationsCount: 0 } as any}
                    onSaveLead={() => setShowLeadModal(true)}
                    onUpgradeClick={handleUpgrade}
                  />
                ) : (
                  <EmptyState />
                )}
              </section>

              <PaywallModal
                isOpen={showLimitModal}
                onClose={() => setShowLimitModal(false)}
                onUpgrade={handleUpgrade}
                title="Limite Atingido"
                description={`Você usou seu limite de ${SYSTEM_LIMITS.FREE_SIMULATIONS} simulações gratuitas. Assine o PRO para continuar.`}
              />

              <div className="md:hidden fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white/50 flex z-50 h-20 shadow-2xl overflow-hidden ring-1 ring-black/5">
                <button onClick={() => setMobileSimView('INPUT')} className={`flex-1 flex flex-col items-center justify-center gap-1.5 ${mobileSimView === 'INPUT' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400'}`}>
                  <CalcIcon className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Simular</span>
                </button>
                <button onClick={() => setMobileSimView('RESULT')} className={`flex-1 flex flex-col items-center justify-center gap-1.5 ${mobileSimView === 'RESULT' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400'}`}>
                  <PieChart className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Resultado</span>
                </button>
              </div>
            </div>
          } />

          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthScreen onLogin={refreshUser} />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              {user?.type === UserRole.CORRETOR ? (
                <AgentDashboard user={user} onSelectLead={(lead) => navigate('/simulador', { state: { loadLead: lead } })} onUpgrade={handleUpgrade} />
              ) : (
                <ClientDashboard
                  user={user!}
                  onNewSimulation={() => navigate('/simulador')}
                  onSelectSimulation={(sim) => navigate('/simulador', { state: { loadSim: sim } })}
                />
              )}
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfilePanel user={user!} onUpdate={refreshUser} onLogout={handleLogout} onUpgrade={handleUpgrade} />
            </ProtectedRoute>
          } />

          <Route path="/onboarding" element={
            user ? (
              user.setupCompleted ? <Navigate to="/dashboard" /> : <OnboardingScreen user={user} onComplete={refreshUser} />
            ) : <Navigate to="/login" />
          } />

          <Route path="/admin" element={
            <ProtectedRoute>
              {(user?.email?.includes('admin') || user?.email === 'lemes_333@hotmail.com') ? <AdminPanel /> : <Navigate to="/dashboard" />}
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {showLeadModal && user && (
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
              toast.success("Lead salvo!");
              setShowLeadModal(false);
            } catch (e: any) {
              toast.error(`Erro: ${e.message}`);
            }
          }}
        />
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center animate-fade-in">
    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
      <CalcIcon className="w-10 h-10 text-blue-200" />
    </div>
    <h2 className="text-xl font-bold text-slate-600 mb-2">Simulador FinanSmart</h2>
    <p className="max-w-md text-sm text-slate-400">Experimente diferentes cenários de financiamento e amortização.</p>
  </div>
);

const ConfigErrorScreen = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-center">
    <div className="bg-white p-8 rounded-2xl max-w-md">
      <Settings className="w-12 h-12 mx-auto mb-4 text-blue-600" />
      <h1 className="text-xl font-bold">Configuração Pendente</h1>
      <p className="text-slate-500 mt-2">Verifique as chaves do Supabase no arquivo .env</p>
    </div>
  </div>
);

export default App;
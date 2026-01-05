import React, { useState, useRef, useEffect } from 'react';
import { Layout, LogOut, Lock, LayoutDashboard, Calculator as CalcIcon, UserCircle, Menu, Edit3, PieChart, Star } from 'lucide-react';
import { SimulationData, CalculationResult, UserProfile, LeadData, SavedSimulation } from './types';
import { calculateSimulation, formatCurrency } from './utils/finance';
import { logout, getStoredUser, updateUserProfile } from './utils/auth';
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

type ViewType = 'CALCULATOR' | 'DASHBOARD' | 'PROFILE';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('CALCULATOR');
  
  // Mobile specific state for Calculator view: Toggle between Form inputs and Results
  const [mobileSimView, setMobileSimView] = useState<'FORM' | 'RESULT'>('FORM');
  
  // -- Data State --
  // Default Interest Rate updated to 11.63 (Caixa Reference) to match current market reality
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

  // -- Mock Database --
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [history, setHistory] = useState<SavedSimulation[]>([]);
  
  // -- Flow State --
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false); // New limit modal
  const [pendingResult, setPendingResult] = useState<CalculationResult | null>(null);
  
  const resultRef = useRef<HTMLDivElement>(null);

  // Check for persistent session
  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      // If user is logged in, load some mock data
      if (stored.type === 'CORRETOR') {
        setLeads([
          { id: '1', name: 'Roberto Almeida', email: 'roberto@email.com', phone: '(11) 99999-0000', interest: 'R$ 750.000', status: 'NOVO', date: new Date().toISOString() },
          { id: '2', name: 'Fernanda Costa', email: 'fernanda@email.com', phone: '(11) 98888-1111', interest: 'R$ 450.000', status: 'CONTATADO', date: new Date(Date.now() - 86400000).toISOString() },
        ]);
      } else {
        setHistory([
          { id: '1', date: new Date(Date.now() - 100000000).toISOString(), propertyValue: 450000, termYears: 30, monthlyPayment: 3800 },
        ]);
      }
    }
  }, []);

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
    // Prefer dashboard on login
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setResult(null);
    setCurrentView('CALCULATOR');
  };

  const handleUpgrade = async () => {
    if (!user) return;
    // Simulate upgrade process
    const updatedUser: UserProfile = { ...user, plan: 'PRO' };
    setUser(updatedUser);
    await updateUserProfile(updatedUser);
    setShowLimitModal(false);
    alert("Parabéns! Plano Profissional ativado com sucesso.");
  };

  const handleSimulate = async () => {
    if (!user) return;

    // STRICT PLAN LIMIT CHECK (Backend Logic Simulation)
    if (user.plan === 'FREE' && user.simulationsCount >= 5) {
        setShowLimitModal(true);
        return;
    }

    try {
      console.log('Calculating...');
      const res = calculateSimulation(data);
      console.log('Calculation done:', res);
      
      // Increment simulation count AND PERSIST
      const updatedUser = { ...user, simulationsCount: user.simulationsCount + 1 };
      setUser(updatedUser);
      await updateUserProfile(updatedUser);

      if (user?.type === 'CLIENTE') {
         const newSim: SavedSimulation = {
           id: generateId(),
           date: new Date().toISOString(),
           propertyValue: data.propertyValue,
           termYears: data.termYears,
           monthlyPayment: res.firstInstallment
         };
         setHistory(prev => [newSim, ...prev]);
         finalizeSimulation(res);
      } else {
         // Corretor or fallback
         finalizeSimulation(res);
      }
    } catch (error) {
      console.error("Simulation error:", error);
      alert("Erro ao calcular simulação. Verifique os dados.");
    }
  };

  const handleLeadSubmit = (leadData: LeadData) => {
    console.log('Lead Captured:', leadData); 
    setShowLeadModal(false);
    if (pendingResult) {
      finalizeSimulation(pendingResult);
    }
  };

  const finalizeSimulation = (res: CalculationResult) => {
    setResult(res);
    // Force view switch to show result
    setCurrentView('CALCULATOR');
    // On mobile, automatically switch tab to result
    setMobileSimView('RESULT');
    
    // Ensure render cycle is complete before scrolling (mostly for desktop)
    setTimeout(() => {
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // -- Views --

  // 1. Auth View (New Component)
  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // 2. Main Application
  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Top Bar (Simplified for Mobile) */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('DASHBOARD')}>
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">Finan<span className="text-blue-600">Smart</span></span>
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
        <div className="flex items-center gap-4">
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
                 <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full border-2 border-slate-100 group-hover:border-blue-200" />
             ) : (
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs bg-blue-500`}>
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
      {currentView === 'CALCULATOR' && <BankCarousel />}

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
          
          {/* PROFILE VIEW */}
          {currentView === 'PROFILE' && (
             <div className="h-full overflow-y-auto bg-slate-50">
                <UserProfilePanel 
                  user={user} 
                  onUpdate={setUser} 
                  onLogout={handleLogout} 
                />
             </div>
          )}

          {/* DASHBOARD VIEW */}
          {currentView === 'DASHBOARD' && (
              <div className="h-full overflow-y-auto bg-slate-50 pb-20 md:pb-0">
                  {user.type === 'CORRETOR' ? (
                      <AgentDashboard user={user} leads={leads} />
                  ) : (
                      <ClientDashboard 
                        user={user} 
                        history={history} 
                        onNewSimulation={() => setCurrentView('CALCULATOR')} 
                      />
                  )}
              </div>
          )}

          {/* CALCULATOR VIEW */}
          {currentView === 'CALCULATOR' && (
             <div className="h-full flex flex-col md:flex-row pb-16 md:pb-0">
                
                {/* Mobile Tab Toggle (Dados vs Resultado) */}
                <div className="md:hidden flex-shrink-0 px-4 py-3 bg-white border-b border-slate-200 flex gap-2">
                    <button 
                      onClick={() => setMobileSimView('FORM')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mobileSimView === 'FORM' ? 'bg-slate-100 text-blue-600 ring-2 ring-blue-600/10' : 'text-slate-500'}`}
                    >
                      <Edit3 className="w-4 h-4" /> Dados
                    </button>
                    <button 
                      onClick={() => setMobileSimView('RESULT')}
                      disabled={!result}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mobileSimView === 'RESULT' ? 'bg-slate-100 text-blue-600 ring-2 ring-blue-600/10' : 'text-slate-500'} ${!result ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <PieChart className="w-4 h-4" /> Resultado
                    </button>
                </div>

                {/* Left Sidebar: Inputs */}
                {/* Visible on Desktop ALWAYS. Visible on Mobile ONLY if View is FORM */}
                <aside className={`w-full md:w-[400px] bg-white border-r border-slate-200 z-10 flex-col overflow-hidden md:flex-shrink-0 ${mobileSimView === 'FORM' ? 'flex flex-1' : 'hidden md:flex md:h-full'}`}>
                    <CalculatorForm 
                        data={data} 
                        onChange={setData} 
                        onSimulate={handleSimulate} 
                    />
                </aside>

                {/* Right Content: Results */}
                {/* Visible on Desktop ALWAYS. Visible on Mobile ONLY if View is RESULT */}
                <section 
                  ref={resultRef}
                  className={`bg-slate-50 overflow-y-auto relative ${mobileSimView === 'RESULT' ? 'block flex-1' : 'hidden md:block md:flex-1 md:h-full'}`}
                >
                    {result ? (
                        <ResultDashboard data={data} result={result} user={user} />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center animate-fade-in">
                          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                              <CalcIcon className="w-10 h-10 text-blue-200" />
                          </div>
                          <h2 className="text-xl font-bold text-slate-600 mb-2">Novo Cálculo</h2>
                          <p className="max-w-md text-sm text-slate-400">
                              Preencha os dados {window.innerWidth < 768 ? 'na aba "Dados"' : 'à esquerda'} para gerar uma análise financeira detalhada.
                          </p>
                          {/* Mobile Call to Action to go back to Inputs */}
                          <button 
                            onClick={() => setMobileSimView('FORM')}
                            className="md:hidden mt-6 bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-blue-600/20"
                          >
                            Preencher Dados
                          </button>
                        </div>
                    )}
                </section>
             </div>
          )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center z-30 shadow-lg pb-safe">
        <button 
          onClick={() => setCurrentView('CALCULATOR')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentView === 'CALCULATOR' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <CalcIcon className={`w-6 h-6 ${currentView === 'CALCULATOR' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-medium">Simulador</span>
        </button>
        
        <button 
          onClick={() => setCurrentView('DASHBOARD')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentView === 'DASHBOARD' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <LayoutDashboard className={`w-6 h-6 ${currentView === 'DASHBOARD' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-medium">Início</span>
        </button>
        
        <button 
          onClick={() => setCurrentView('PROFILE')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentView === 'PROFILE' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <UserCircle className={`w-6 h-6 ${currentView === 'PROFILE' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </nav>
      
      {/* Helper style for iPhone Home Bar area */}
      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
      `}</style>
      
      {/* Lead Capture Modal */}
      <LeadModal 
        isOpen={showLeadModal} 
        onClose={() => setShowLeadModal(false)}
        onSubmit={handleLeadSubmit}
      />

      {/* PLAN LIMIT MODAL (Monetization Enforcer) */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-scale-in border-4 border-white/10 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-pink-500"></div>
            
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
               <Lock className="w-8 h-8 text-red-500" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3">Limite Atingido</h3>
            
            <p className="text-slate-600 mb-6 text-sm leading-relaxed px-2">
              Você atingiu o limite de <strong>5 simulações gratuitas</strong>.
              Para continuar simulando e gerar PDFs profissionais, assine o plano mensal.
            </p>
            
            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
               <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Plano Profissional</div>
               <div className="text-2xl font-bold text-blue-600">
                  R$ 19,90 <span className="text-sm font-medium text-slate-400">/mês</span>
               </div>
               <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  Simulações e PDFs Ilimitados
               </div>
            </div>

            <div className="space-y-3">
               <button 
                onClick={handleUpgrade}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 transform hover:-translate-y-0.5"
               >
                 Assinar Agora
               </button>
               <button 
                onClick={() => setShowLimitModal(false)}
                className="w-full text-slate-400 font-bold py-2 hover:text-slate-600 transition-colors text-sm"
               >
                 Apenas visualizar histórico
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
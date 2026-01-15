import React, { useEffect, useState } from 'react';
import { SavedSimulation, UserProfile, MAX_FREE_SIMULATIONS } from '../types';
import { Clock, ArrowRight, Home, Calculator, Trash2, Zap, Star, Eye, RefreshCw, ChevronRight, CheckCircle2, Lock } from 'lucide-react';
import { formatCurrency } from '../utils/finance';
import { supabase } from '../utils/supabaseClient';
import { toast } from 'sonner';
import { subscribeToPro } from '../utils/stripePayment';

interface Props {
  user: UserProfile;
  onNewSimulation: () => void;
  onSelectSimulation: (sim: SavedSimulation) => void;
}

const ClientDashboard: React.FC<Props> = ({ user, onNewSimulation, onSelectSimulation }) => {
  const [history, setHistory] = useState<SavedSimulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [user.id]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_simulations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          date: item.created_at,
          propertyValue: item.property_value,
          downPayment: item.down_payment || item.property_value * 0.2,
          termYears: item.term_years,
          monthlyPayment: item.monthly_payment,
          interestRate: item.interest_rate_annual || 11.0,
          amortizationSystem: item.amortization_system || 'SAC',
          monthlyIncome: item.monthly_income || 0
        }));
        setHistory(mapped);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar histórico.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSimulation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Tem certeza que deseja excluir esta simulação?")) return;

    try {
      const { error } = await supabase.from('saved_simulations').delete().eq('id', id);
      if (error) throw error;

      setHistory(prev => prev.filter(s => s.id !== id));
      toast.success("Simulação removida.");
    } catch (err) {
      toast.error("Erro ao excluir simulação.");
    }
  };

  const handleUpgrade = async () => {
    try {
      if (!user.email) {
        toast.error("Email do usuário não encontrado.");
        return;
      }
      toast.info("Iniciando checkout...");
      await subscribeToPro(user.email, user.id);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao iniciar pagamento.");
    }
  };

  const usagePercent = Math.min((user.simulationsCount / MAX_FREE_SIMULATIONS) * 100, 100);
  const remaining = Math.max(MAX_FREE_SIMULATIONS - user.simulationsCount, 0);

  return (
    <div className="p-4 md:p-10 max-w-[1200px] mx-auto space-y-10 animate-fade-in pb-24 font-sans">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Olá, <span className="text-blue-600">{user.name.split(' ')[0]}!</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Bem-vindo ao seu painel de controle financeiro.</p>
        </div>

        <button
          onClick={onNewSimulation}
          className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 group"
        >
          <Calculator className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Nova Simulação
        </button>
      </div>

      {/* PLAN & USAGE WIDGET */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden group">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">

          <div className="flex items-center gap-6">
            <div className={`p-5 rounded-[1.5rem] shadow-inner ${user.plan === 'PRO' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
              {user.plan === 'PRO' ? <Star className="w-10 h-10 fill-emerald-600" /> : <Zap className="w-10 h-10 fill-blue-600" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Seu Plano</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.plan === 'PRO' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {user.plan}
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {user.plan === 'PRO' ? 'Acesso Vitalício Ativo' : `${remaining} simulações restantes`}
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-md space-y-4">
            {user.plan === 'FREE' ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uso Mensal</span>
                    <span className="text-xs font-black text-blue-600">{user.simulationsCount}/{MAX_FREE_SIMULATIONS}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${usagePercent > 80 ? 'bg-amber-500' : 'bg-blue-600'}`}
                      style={{ width: `${usagePercent}%` }}
                    ></div>
                  </div>
                </div>
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-900 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  Fazer Upgrade para PRO <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center justify-end gap-3 text-emerald-600">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</span>
                  <span className="font-black">Ilimitado Liberado</span>
                </div>
                <CheckCircle2 className="w-8 h-8" />
              </div>
            )}
          </div>
        </div>

        {/* Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100/50 transition-colors"></div>
      </div>

      {/* HISTORY LIST */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-600" />
            Histórico de Simulações
          </h2>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {history.length} Resultados
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Banco de Dados...</p>
            </div>
          ) : history.length > 0 ? (
            <>
              {(user.plan === 'PRO' ? history : history.slice(0, 3)).map((sim) => (
                <div
                  key={sim.id}
                  className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-2xl hover:shadow-blue-900/5 transition-all group border-l-[6px] border-l-blue-600"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Home className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registrada em</span>
                        <span className="text-xs font-bold text-slate-600">
                          {new Date(sim.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-2xl font-black text-slate-900 tracking-tight">
                        {formatCurrency(sim.propertyValue)}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-medium text-slate-500">Parcela: <span className="font-black text-emerald-600">{formatCurrency(sim.monthlyPayment)}</span></span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span className="text-xs font-medium text-slate-500">{sim.termYears} anos • {sim.amortizationSystem}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onSelectSimulation(sim)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-50 text-slate-700 px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Eye className="w-4 h-4" /> Detalhes
                    </button>
                    <button
                      onClick={() => onSelectSimulation(sim)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" /> Re-simular
                    </button>
                    <div className="w-px h-8 bg-slate-100 mx-2 hidden md:block"></div>
                    <button
                      onClick={(e) => handleDeleteSimulation(sim.id, e)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {user.plan === 'FREE' && history.length > 3 && (
                <div onClick={handleUpgrade} className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-center text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden group active:scale-[0.98] transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform"></div>
                  <Lock className="w-10 h-10 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-black mb-2 italic">Histórico Limitado</h3>
                  <p className="text-blue-100 text-sm font-medium mb-6 max-w-sm mx-auto">Você tem mais {history.length - 3} simulações salvas. Desbloqueie o acesso completo agora!</p>
                  <span className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:px-10 transition-all">
                    Assinar Plano PRO <Star className="w-4 h-4 fill-blue-600" />
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 bg-white border border-dashed border-slate-300 rounded-[3rem] flex flex-col items-center text-center px-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Clock className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Sem Histórico ainda</h3>
              <p className="text-slate-500 font-medium max-w-sm mb-8">Comece a fazer simulações para ver seus resultados salvos aqui automaticamente.</p>
              <button
                onClick={onNewSimulation}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
              >
                Fazer minha primeira simulação
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
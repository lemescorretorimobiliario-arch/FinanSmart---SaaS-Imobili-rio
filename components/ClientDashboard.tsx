import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SavedSimulation, UserProfile } from '../types';
import { Clock, Calculator, Trash2, Zap, Star, RefreshCw, ChevronRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/finance';
import { supabase } from '../utils/supabaseClient';
import { toast } from 'sonner';
import { subscribeToPro } from '../utils/stripePayment';
import { simulationService } from '../services/simulationService';
import { UserPlan, SYSTEM_LIMITS } from '../core/system';

interface Props {
  user: UserProfile;
  onNewSimulation: () => void;
  onSelectSimulation: (sim: SavedSimulation) => void;
}

const ClientDashboard: React.FC<Props> = ({ user, onNewSimulation, onSelectSimulation }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<SavedSimulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [user.id]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await simulationService.getHistory(user.id);
      setHistory(data);
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
      if (!user.email) return;
      await subscribeToPro(user.email, user.id);
    } catch (error) {
      toast.error("Erro ao iniciar pagamento.");
    }
  };

  const usagePercent = Math.min((user.simulationsCount / SYSTEM_LIMITS.FREE_SIMULATIONS) * 100, 100);

  return (
    <div className="p-3 md:p-6 max-w-6xl mx-auto space-y-4 md:space-y-6 animate-fade-in pb-20 md:pb-8 font-sans">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Seja bem-vindo, <span className="text-blue-600">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 font-medium text-xs mt-0.5">Visão geral do seu planejamento imobiliário.</p>
        </div>

        <button
          onClick={onNewSimulation}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 group"
        >
          <Calculator className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          Nova Simulação
        </button>
      </div>

      {/* PLAN & USAGE WIDGET */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Card 1: Status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${user.plan === UserPlan.PRO ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
              {user.plan === UserPlan.PRO ? <Star className="w-6 h-6 fill-emerald-600" /> : <Zap className="w-6 h-6 fill-blue-600" />}
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status da Conta</div>
              <div className="text-xl font-black text-slate-900 uppercase">{user.plan}</div>
            </div>
          </div>
          {user.plan === UserPlan.FREE && (
            <button
              onClick={handleUpgrade}
              className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              Liberar Ilimitado
            </button>
          )}
        </div>

        {/* Card 2: Usage */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-center">
          {user.plan === 'PRO' ? (
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-black text-xs uppercase tracking-widest">Acesso Ilimitado Liberado</span>
            </div>
          ) : (
            <div className="space-y-2 w-full">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Simulações Realizadas</span>
                <span className="text-xs font-black text-slate-900">{user.simulationsCount} / {SYSTEM_LIMITS.FREE_SIMULATIONS}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${usagePercent > 80 ? 'bg-amber-500' : 'bg-blue-600'}`}
                  style={{ width: `${usagePercent}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* HISTORY SECTION */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" /> Seu Histórico
          </h2>
          <button onClick={fetchHistory} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <RefreshCw className={`w-4 h-4 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Carregando histórico...</div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-bold mb-1">Sem simulações</h3>
              <p className="text-slate-500 text-xs mb-6">Comece agora para salvar seu primeiro histórico.</p>
              <button onClick={onNewSimulation} className="bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                Criar Simulação
              </button>
            </div>
          ) : (
            history.map((sim) => (
              <div
                key={sim.id}
                onClick={() => onSelectSimulation(sim)}
                className="group p-4 hover:bg-blue-50/30 transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm transition-all border border-transparent group-hover:border-blue-100">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-sm">{formatCurrency(sim.propertyValue)}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5 font-bold uppercase tracking-wider">
                      <span>{new Date(sim.date).toLocaleDateString('pt-BR')}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{sim.amortizationSystem}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:block text-right">
                    <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Parcela</div>
                    <div className="font-black text-slate-900 text-sm">{formatCurrency(sim.monthlyPayment)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeleteSimulation(sim.id, e)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <button onClick={() => navigate('/simulador')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
              Ver Histórico Completo em PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
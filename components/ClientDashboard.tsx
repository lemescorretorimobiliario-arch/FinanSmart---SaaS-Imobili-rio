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
    <div className="p-3 md:p-6 max-w-6xl mx-auto space-y-4 md:space-y-6 animate-fade-in pb-20 md:pb-8 font-sans">

      {/* HEADER SECTION - Compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Painel do Cliente
          </h1>
          <p className="text-slate-500 font-medium text-xs mt-0.5">Gerencie suas simulações e assinaturas.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewSimulation}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 group"
          >
            <Calculator className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Nova Simulação
          </button>
        </div>
      </div>

      {/* PLAN & USAGE WIDGET - Compact Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Card 1: Status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden group">
          <div className="relative z-10 flex items-center gap-4">
            <div className={`p-3 rounded-xl shadow-sm ${user.plan === 'PRO' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
              {user.plan === 'PRO' ? <Star className="w-6 h-6 fill-emerald-600" /> : <Zap className="w-6 h-6 fill-blue-600" />}
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seu Plano Atual</div>
              <div className="text-xl font-black text-slate-900">{user.plan}</div>
            </div>
          </div>
          {user.plan === 'FREE' && (
            <button
              onClick={handleUpgrade}
              className="px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-100 transition-colors"
            >
              Fazer Upgrade
            </button>
          )}
        </div>

        {/* Card 2: Usage */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden">
          {user.plan === 'PRO' ? (
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold text-sm">Simulações Ilimitadas Ativas</span>
            </div>
          ) : (
            <div className="space-y-2 w-full">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uso de Simulações</span>
                <span className="text-xs font-black text-slate-900">{user.simulationsCount} / {MAX_FREE_SIMULATIONS}</span>
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" /> Histórico Recente
          </h2>
          <button onClick={fetchHistory} className="p-2 hover:bg-slate-200 rounded-lg transition-colors" title="Atualizar">
            <RefreshCw className={`w-4 h-4 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Carregando histórico...</div>
          ) : history.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-bold mb-1 text-sm">Nenhuma simulação salva</h3>
              <p className="text-slate-500 text-xs mb-4">Suas simulações aparecerão aqui.</p>
              <button onClick={onNewSimulation} className="text-blue-600 font-bold text-xs hover:underline uppercase tracking-wide">
                Criar primeira simulação
              </button>
            </div>
          ) : (
            history.map((sim) => (
              <div
                key={sim.id}
                onClick={() => onSelectSimulation(sim)}
                className="group p-4 hover:bg-blue-50/30 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{formatCurrency(sim.propertyValue)}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{new Date(sim.date).toLocaleDateString('pt-BR')}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{sim.amortizationSystem}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-14 sm:pl-0">
                  <div className="text-left sm:text-right">
                    <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Parcela Inicial</div>
                    <div className="font-bold text-slate-900 text-sm">{formatCurrency(sim.monthlyPayment)}</div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDeleteSimulation(sim.id, e)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
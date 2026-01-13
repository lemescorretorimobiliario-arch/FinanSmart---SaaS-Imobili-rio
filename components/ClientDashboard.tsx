import React, { useEffect, useState } from 'react';
import { SavedSimulation, UserProfile } from '../types';
import { Clock, ArrowRight, Home, Calculator, Trash2, Zap, Star } from 'lucide-react';
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
    const { data, error } = await supabase
      .from('saved_simulations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped = data.map((item: any) => ({
        id: item.id,
        date: item.created_at,
        propertyValue: item.property_value,
        downPayment: item.down_payment || item.property_value * 0.2, // fallback
        termYears: item.term_years,
        monthlyPayment: item.monthly_payment,
        interestRate: item.interest_rate_annual || 11.0, // fallback
        amortizationSystem: item.amortization_system || 'SAC',
        monthlyIncome: item.monthly_income || 0
      }));
      setHistory(mapped);
    }
    setIsLoading(false);
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

  const usagePercent = Math.min((user.simulationsCount / 5) * 100, 100);
  const remaining = Math.max(5 - user.simulationsCount, 0);

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-6 md:space-y-8 animate-fade-in pb-20">

      {/* LIMIT & WELCOME SECTION */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl md:rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 relative z-10">Olá, {user.name.split(' ')[0]}!</h1>
            <p className="text-blue-100 text-sm md:text-lg mb-6 relative z-10">Pronto para realizar o sonho da casa própria?</p>
          </div>

          <button
            onClick={onNewSimulation}
            className="w-fit bg-white text-blue-700 px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm text-sm md:text-base relative z-10"
          >
            <Calculator className="w-4 h-4 md:w-5 md:h-5" />
            Nova Simulação
          </button>
        </div>

        {/* Usage / Plan Card */}
        <div className="bg-white rounded-xl md:rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          {user.plan === 'PRO' ? (
            <>
              <div className="absolute top-0 right-0 bg-yellow-400 w-16 h-16 blur-2xl opacity-20"></div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg">
                    <Star className="w-5 h-5 fill-yellow-600" />
                  </div>
                  <span className="font-bold text-slate-900 text-lg">Cliente PRO</span>
                </div>
                <p className="text-slate-500 text-sm">Você tem acesso ilimitado a todas as funcionalidades.</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <Zap className="w-4 h-4" /> Simulações Ilimitadas
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-900 text-lg">Plano Gratuito</span>
                  <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-bold">Free</span>
                </div>
                <p className="text-slate-500 text-sm mb-4">Você tem {remaining} simulações restantes este mês.</p>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${usagePercent}%` }}></div>
                </div>
                <p className="text-xs text-right text-slate-400 font-bold">{user.simulationsCount} / 5 Usadas</p>
              </div>

              <button
                className="mt-4 w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                onClick={handleUpgrade}
              >
                Assinar PRO <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
        <Clock className="w-5 h-5 text-slate-400" />
        Histórico de Simulações
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {isLoading ? (
          <div className="col-span-2 text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-slate-400 text-sm">Carregando histórico...</p>
          </div>
        ) : history.length > 0 ? history.map((sim) => (
          <div
            key={sim.id}
            onClick={() => onSelectSimulation(sim)}
            className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all group cursor-pointer hover:shadow-md hover:translate-y-[-2px] relative"
            title="Clique para ver os detalhes"
          >
            <div className="flex justify-between items-start mb-2 md:mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 md:p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Home className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-[10px] md:text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                  {new Date(sim.date).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={(e) => handleDeleteSimulation(sim.id, e)}
                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir simulação"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-3 md:mb-4">
              <p className="text-xs md:text-sm text-slate-500 font-medium">Valor do Imóvel</p>
              <p className="text-lg md:text-xl font-bold text-slate-800">{formatCurrency(sim.propertyValue)}</p>
            </div>

            <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-slate-100">
              <div>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium uppercase tracking-wide">Parcela Estimada</p>
                <p className="text-sm md:text-base font-bold text-emerald-600">{formatCurrency(sim.monthlyPayment)}</p>
              </div>
              <div className="text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Ver Detalhes</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-2 text-center py-8 md:py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium">Você ainda não salvou nenhuma simulação.</p>
            <button onClick={onNewSimulation} className="text-blue-600 text-sm font-bold mt-2 hover:underline">
              Começar agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
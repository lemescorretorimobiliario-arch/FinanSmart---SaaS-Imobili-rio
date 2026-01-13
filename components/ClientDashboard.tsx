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
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-10 animate-fade-in-up pb-24">

      {/* WELCOME & LIMIT SECTION */}
      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        {/* Welcome Card */}
        <div className="lg:col-span-2 premium-gradient rounded-[2rem] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[240px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <h1 className="text-2xl md:text-4xl font-black mb-2 leading-tight tracking-tight">Olá, {user.name.split(' ')[0]}!</h1>
            <p className="text-blue-100 text-base md:text-lg font-medium opacity-90 max-w-md">Vamos planejar o próximo grande passo da sua vida hoje?</p>
          </div>

          <button
            onClick={onNewSimulation}
            className="w-fit bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center gap-2.5 shadow-xl shadow-blue-900/20 relative z-10 group active:scale-95 text-sm"
          >
            <Calculator className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Nova Simulação
          </button>
        </div>

        {/* Usage / Plan Card */}
        <div className="glass-card rounded-[2rem] p-6 border border-white flex flex-col justify-between relative overflow-hidden group">
          {user.plan === 'PRO' ? (
            <>
              <div className="absolute top-0 right-0 bg-yellow-400 w-24 h-24 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-2.5 bg-yellow-100 text-yellow-600 rounded-xl shadow-inner">
                    <Star className="w-5 h-5 fill-yellow-600" />
                  </div>
                  <span className="font-black text-slate-900 text-lg tracking-tight uppercase">Assinante PRO</span>
                </div>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">Você desbloqueou o poder total. Simulações ilimitadas e PDFs profissionais liberados.</p>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <Zap className="w-5 h-5 fill-emerald-600 animate-pulse" /> Status: Ativo ilimitado
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-black text-slate-900 text-lg tracking-tight uppercase">Plano Free</span>
                  <span className="bg-slate-900 text-white text-[9px] px-2.5 py-1 rounded-full font-black tracking-widest uppercase shadow-md">Básico</span>
                </div>

                <div className="space-y-3">
                  <p className="text-slate-500 font-medium text-sm">Você ainda tem <span className="text-blue-600 font-black">{remaining}</span> simulações este mês.</p>

                  {/* Premium Progress Bar */}
                  <div className="relative pt-1">
                    <div className="flex mb-1.5 items-center justify-between">
                      <div>
                        <span className="text-[9px] font-black inline-block text-slate-400 uppercase tracking-wider">Uso Mensal</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black inline-block text-blue-600">
                          {user.simulationsCount}/5
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2.5 mb-3 text-xs flex rounded-full bg-slate-100 border border-slate-200 shadow-inner">
                      <div
                        style={{ width: `${usagePercent}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ease-out ${usagePercent > 80 ? 'bg-amber-500' : 'bg-blue-600'}`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="mt-3 w-full premium-gradient text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 group"
                onClick={handleUpgrade}
              >
                Ser PRO Agora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Clock className="w-6 h-6 text-blue-600" />
          Minhas Simulações
        </h2>
        <div className="text-sm font-medium text-slate-400 italic">
          {history.length} {history.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sincronizando dados...</p>
          </div>
        ) : history.length > 0 ? history.map((sim) => (
          <div
            key={sim.id}
            onClick={() => onSelectSimulation(sim)}
            className="group bg-white p-5 md:p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:border-blue-300 transition-all cursor-pointer hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1.5 relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <Home className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registrada em</span>
                  <span className="text-xs font-bold text-slate-600">
                    {new Date(sim.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteSimulation(sim.id, e)}
                className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-8 relative z-10">
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-1">Valor do Imóvel</p>
              <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(sim.propertyValue)}</p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100 relative z-10">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Parcela Estimada</p>
                <p className="text-lg font-black text-emerald-600">{formatCurrency(sim.monthlyPayment)}</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 md:py-32 glass-card rounded-[3rem] border border-dashed border-slate-300 flex flex-col items-center text-center px-6">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-white shadow-inner">
              <Calculator className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Histórico Vazio</h3>
            <p className="text-slate-500 font-medium max-w-sm mb-10">Você ainda não salvou nenhuma simulação. Comece agora e planeje seu futuro.</p>
            <button
              onClick={onNewSimulation}
              className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-xl active:scale-95"
            >
              Criar Primeira Simulação
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
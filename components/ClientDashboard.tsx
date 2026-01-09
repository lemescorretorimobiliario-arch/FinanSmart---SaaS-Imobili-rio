import React, { useEffect, useState } from 'react';
import { SavedSimulation, UserProfile } from '../types';
import { Clock, ArrowRight, Home, Calculator } from 'lucide-react';
import { formatCurrency } from '../utils/finance';
import { supabase } from '../utils/supabaseClient';

interface Props {
  user: UserProfile;
  onNewSimulation: () => void;
  onSelectSimulation: (sim: SavedSimulation) => void;
}

const ClientDashboard: React.FC<Props> = ({ user, onNewSimulation, onSelectSimulation }) => {
  const [history, setHistory] = useState<SavedSimulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
        // Query scoped by user_id explicitly for clarity
        const { data, error } = await supabase
            .from('saved_simulations')
            .select('*')
            .eq('user_id', user.id) // Reinforced client-side filter
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
    
    fetchHistory();
  }, [user.id]); // Re-fetch if user ID changes

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-6 md:space-y-8 animate-fade-in pb-20">
       {/* Welcome Header */}
       <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl md:rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
         {/* Background Pattern */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         
         <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 relative z-10">Olá, {user.name.split(' ')[0]}!</h1>
         <p className="text-blue-100 text-sm md:text-lg mb-4 md:mb-6 relative z-10">Pronto para realizar o sonho da casa própria?</p>
         
         <button 
           onClick={onNewSimulation}
           className="bg-white text-blue-700 px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm text-sm md:text-base relative z-10"
         >
           <Calculator className="w-4 h-4 md:w-5 md:h-5" />
           Nova Simulação
         </button>
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
                <div className="p-1.5 md:p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Home className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-[10px] md:text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                    {new Date(sim.date).toLocaleDateString()}
                </span>
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
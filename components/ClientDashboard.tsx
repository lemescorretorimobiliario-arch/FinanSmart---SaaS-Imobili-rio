import React from 'react';
import { SavedSimulation, UserProfile } from '../types';
import { Clock, ArrowRight, Home, Calculator } from 'lucide-react';
import { formatCurrency } from '../utils/finance';

interface Props {
  user: UserProfile;
  history: SavedSimulation[];
  onNewSimulation: () => void;
}

const ClientDashboard: React.FC<Props> = ({ user, history, onNewSimulation }) => {
  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-6 md:space-y-8 animate-fade-in pb-20">
       {/* Welcome Header */}
       <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl md:rounded-2xl p-6 md:p-8 text-white shadow-xl">
         <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Olá, {user.name}!</h1>
         <p className="text-blue-100 text-sm md:text-lg mb-4 md:mb-6">Pronto para realizar o sonho da casa própria?</p>
         <button 
           onClick={onNewSimulation}
           className="bg-white text-blue-700 px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm text-sm md:text-base"
         >
           <Calculator className="w-4 h-4 md:w-5 md:h-5" />
           Nova Simulação
         </button>
       </div>

       <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
         <Clock className="w-5 h-5 text-slate-400" />
         Histórico
       </h2>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
         {history.length > 0 ? history.map((sim) => (
           <div key={sim.id} className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all group cursor-pointer">
             <div className="flex justify-between items-start mb-2 md:mb-3">
                <div className="p-1.5 md:p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Home className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-[10px] md:text-xs text-slate-400">{new Date(sim.date).toLocaleDateString()}</span>
             </div>
             
             <div className="mb-3 md:mb-4">
                <p className="text-xs md:text-sm text-slate-500">Valor do Imóvel</p>
                <p className="text-lg md:text-xl font-bold text-slate-800">{formatCurrency(sim.propertyValue)}</p>
             </div>

             <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-slate-100">
                <div>
                   <p className="text-[10px] md:text-xs text-slate-400">Parcela Estimada</p>
                   <p className="text-sm md:text-base font-semibold text-slate-700">{formatCurrency(sim.monthlyPayment)}</p>
                </div>
                <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                   <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </div>
             </div>
           </div>
         )) : (
           <div className="col-span-2 text-center py-8 md:py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm">
             <p>Você ainda não salvou nenhuma simulação.</p>
           </div>
         )}
       </div>
    </div>
  );
};

export default ClientDashboard;
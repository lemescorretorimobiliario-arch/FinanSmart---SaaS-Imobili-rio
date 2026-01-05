import React, { useState } from 'react';
import { 
  Download, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Lock,
  PieChart as PieIcon,
  Table as TableIcon,
  Activity,
  CheckCircle,
  XCircle,
  HelpCircle,
  Zap,
  Star
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { CalculationResult, SimulationData, UserProfile } from '../types';
import { formatCurrency } from '../utils/finance';
import { generatePDF } from '../utils/pdfGenerator';

interface ResultDashboardProps {
  data: SimulationData;
  result: CalculationResult;
  user: UserProfile;
}

const ResultDashboard: React.FC<ResultDashboardProps> = ({ data, result, user }) => {
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'TABLE' | 'CHARTS'>('SUMMARY');
  const [showPaywall, setShowPaywall] = useState(false);

  const handleExport = () => {
    // Logic: Free users can export their first 5 simulations.
    // If they have reached the limit (>=5) AND are on FREE plan, block export.
    if (user.plan === 'FREE' && user.simulationsCount >= 5) {
      setShowPaywall(true);
      return;
    }
    generatePDF(data, result, user);
  };

  const COLORS = ['#3b82f6', '#94a3b8']; // Blue-500, Slate-400

  // Chart Data Preparation
  const balanceData = result.schedule.filter((_, i) => i % 12 === 0 || i === result.schedule.length - 1).map(row => ({
    name: `Ano ${Math.floor(row.month / 12)}`,
    Saldo: row.balance,
    Juros: row.interest
  }));

  const pieData = [
    { name: 'Valor Financiado', value: result.financedAmount },
    { name: 'Juros Totais', value: result.totalInterest },
  ];

  // Comparative Data
  const comparisonData = result.comparison?.isActive ? [
    { name: 'Sem Amortização', Total: result.comparison.originalTotalPaid },
    { name: 'Com Amortização', Total: result.totalPaid },
  ] : [];

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      
      {/* Header Tabs */}
      <div className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 pt-3 px-4 md:px-6 pb-2">
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg w-full md:w-fit shadow-sm overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('SUMMARY')}
            className={`flex-1 md:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'SUMMARY' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-3 h-3 md:w-4 md:h-4" /> Resumo
          </button>
          <button
            onClick={() => setActiveTab('TABLE')}
            className={`flex-1 md:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'TABLE' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <TableIcon className="w-3 h-3 md:w-4 md:h-4" /> Tabela
          </button>
          <button
            onClick={() => setActiveTab('CHARTS')}
            className={`flex-1 md:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'CHARTS' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <PieIcon className="w-3 h-3 md:w-4 md:h-4" /> Gráficos
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 flex-1 overflow-y-visible md:overflow-y-auto custom-scrollbar pb-20 md:pb-6">
        
        {/* SUMMARY TAB */}
        {activeTab === 'SUMMARY' && (
          <div className="space-y-4 animate-fade-in">
            {/* Credit Analysis Card */}
            <div className={`p-4 md:p-6 rounded-xl border-l-4 shadow-sm bg-white ${result.isCreditApproved ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
              <div className="flex justify-between items-start">
                <div className="flex gap-3 md:gap-4">
                  <div className="flex-shrink-0">
                    {result.isCreditApproved 
                      ? <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" /> 
                      : <XCircle className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
                    }
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-slate-800 leading-tight">
                      {result.isCreditApproved ? 'Crédito Pré-Aprovado' : 'Renda Insuficiente'}
                    </h3>
                    <p className="text-slate-500 text-xs md:text-sm mt-1 leading-relaxed">
                      {result.isCreditApproved 
                        ? 'Sua renda comporta a parcela dentro de 30%.' 
                        : `Parcela compromete ${result.incomeCommitmentPercent.toFixed(1)}% da renda (Máx: 30%).`}
                    </p>
                    {!result.isCreditApproved && (
                      <div className="mt-2 text-[10px] md:text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block">
                        Renda Mínima: {formatCurrency(result.requiredMinimumIncome)}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={handleExport} className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Baixar PDF">
                    <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Smart Amortization Savings Card */}
            {result.comparison?.isActive && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-4 md:p-5 rounded-xl shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>
                <div className="flex items-start gap-3 relative z-10">
                  <div className="p-1.5 md:p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <Zap className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-bold text-emerald-900">Economia Projetada</h3>
                    <p className="text-emerald-700 text-xs md:text-sm mt-0.5 mb-2">
                      Com {formatCurrency(data.extraAmortizationMonthly || 0)} mensais:
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <div>
                         <span className="block text-[10px] font-semibold uppercase text-emerald-600">Juros Economizados</span>
                         <span className="text-lg md:text-xl font-bold text-emerald-800">{formatCurrency(result.comparison.savedInterest)}</span>
                      </div>
                      <div className="w-px bg-emerald-200 hidden md:block"></div>
                      <div>
                         <span className="block text-[10px] font-semibold uppercase text-emerald-600">Tempo Reduzido</span>
                         <span className="text-lg md:text-xl font-bold text-emerald-800">
                           {Math.floor(result.comparison.savedMonths / 12)}a {result.comparison.savedMonths % 12}m
                         </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Primeira Parcela
                </div>
                <div className="text-xl md:text-2xl font-bold text-slate-900">{formatCurrency(result.firstInstallment)}</div>
                <div className="text-[10px] text-slate-400 mt-1">Última: {formatCurrency(result.lastInstallment)}</div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3" /> Juros Totais
                </div>
                <div className="text-xl md:text-2xl font-bold text-blue-600">{formatCurrency(result.totalInterest)}</div>
                <div className="text-[10px] text-slate-400 mt-1">Custo do dinheiro</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" /> Total Pago
                </div>
                <div className="text-xl md:text-2xl font-bold text-slate-900">{formatCurrency(result.totalPaid)}</div>
                <div className="text-[10px] text-slate-400 mt-1">Em {result.termMonths} meses</div>
              </div>
            </div>
          </div>
        )}

        {/* CHARTS TAB */}
        {activeTab === 'CHARTS' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in pb-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-60 md:h-80">
                   <h3 className="text-xs md:text-sm font-bold text-slate-700 mb-2 md:mb-4">Saldo Devedor</h3>
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={balanceData}>
                       <defs>
                         <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
                       <XAxis dataKey="name" tick={{fontSize: 9}} hide={true} />
                       <YAxis tickFormatter={(val) => `R$${val/1000}k`} tick={{fontSize: 9}} width={35} />
                       <Tooltip formatter={(val: number) => formatCurrency(val)} />
                       <Area type="monotone" dataKey="Saldo" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBalance)" />
                     </AreaChart>
                   </ResponsiveContainer>
                </div>
                
                {result.comparison?.isActive ? (
                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-60 md:h-80">
                    <h3 className="text-xs md:text-sm font-bold text-slate-700 mb-2 md:mb-4">Economia Total</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} />
                         <XAxis dataKey="name" tick={{fontSize: 9}} />
                         <YAxis tickFormatter={(val) => `R$${val/1000}k`} tick={{fontSize: 9}} width={35} />
                         <Tooltip formatter={(value: number) => formatCurrency(value)} />
                         <Bar dataKey="Total" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-60 md:h-80">
                    <h3 className="text-xs md:text-sm font-bold text-slate-700 mb-2 md:mb-4">Composição</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '10px'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* TABLE TAB */}
        {activeTab === 'TABLE' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
             <div className="overflow-x-auto">
               <table className="w-full text-[10px] md:text-sm text-left">
                 <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[9px] md:text-xs">
                   <tr>
                     <th className="px-2 py-2 md:px-3 md:py-3 whitespace-nowrap">Mês</th>
                     <th className="px-2 py-2 md:px-3 md:py-3 whitespace-nowrap">Parcela</th>
                     <th className="px-2 py-2 md:px-3 md:py-3 whitespace-nowrap">Amort.</th>
                     <th className="px-2 py-2 md:px-3 md:py-3 whitespace-nowrap">Juros</th>
                     <th className="px-2 py-2 md:px-3 md:py-3 text-right whitespace-nowrap">Saldo</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {result.schedule.map((row) => (
                     <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                       <td className="px-2 py-2 md:px-3 md:py-2.5 font-medium text-slate-900">{row.month}</td>
                       <td className="px-2 py-2 md:px-3 md:py-2.5 text-slate-700">{formatCurrency(row.payment)}</td>
                       <td className="px-2 py-2 md:px-3 md:py-2.5 text-emerald-600">{formatCurrency(row.amortization)}</td>
                       <td className="px-2 py-2 md:px-3 md:py-2.5 text-red-500">{formatCurrency(row.interest)}</td>
                       <td className="px-2 py-2 md:px-3 md:py-2.5 text-right text-slate-900 font-medium">{formatCurrency(row.balance)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-scale-in border-4 border-white/10 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Lock className="w-7 h-7 text-blue-600" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">Exportação Bloqueada</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Você atingiu o limite de simulações gratuitas. Exporte relatórios ilimitados com o plano PRO.
            </p>
            
            <div className="bg-slate-50 rounded-lg p-3 mb-6">
                <div className="text-xl font-bold text-slate-800">R$ 19,90 <span className="text-xs text-slate-500 font-normal">/mês</span></div>
            </div>

            <div className="space-y-2">
                <button 
                // In a real app, this would trigger the upgrade flow or redirect to pricing
                onClick={() => { setShowPaywall(false); alert("Redirecionando para assinatura..."); }}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                Assinar PRO
                </button>
                <button 
                onClick={() => setShowPaywall(false)}
                className="w-full text-slate-400 font-medium py-2 text-sm hover:text-slate-600"
                >
                Cancelar
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDashboard;
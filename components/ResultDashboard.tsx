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
  Zap,
  UserPlus,
  MessageCircle,
  Share2,
  Save
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, TooltipProps
} from 'recharts';
import { CalculationResult, SimulationData, UserProfile } from '../types';
import { formatCurrency } from '../utils/finance';
import { generatePDF } from '../utils/pdfGenerator';

interface ResultDashboardProps {
  data: SimulationData;
  result: CalculationResult;
  user: UserProfile;
  onSaveLead?: () => void;
  onUpgradeClick?: () => Promise<void> | void;
}

// Modern Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2.5 md:p-3 border border-slate-100 shadow-xl rounded-xl">
        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs md:text-sm font-semibold text-slate-700">
              {entry.name}:
            </span>
            <span className="text-xs md:text-sm font-bold text-slate-900">
              {formatCurrency(entry.value as number)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ResultDashboard: React.FC<ResultDashboardProps> = ({ data, result, user, onSaveLead, onUpgradeClick }) => {
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'TABLE' | 'CHARTS'>('SUMMARY');
  const [showPaywall, setShowPaywall] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleExport = () => {
    if (user.plan === 'FREE' && user.simulationsCount >= 5) {
      setShowPaywall(true);
      return;
    }
    generatePDF(data, result, user);
  };

  const handleUpgradeWrapper = async () => {
      if (!onUpgradeClick) return;
      setIsUpgrading(true);
      try {
          await onUpgradeClick();
          // Se for redirecionado, o componente desmonta.
          // Se for simulação, fechamos o modal.
          setShowPaywall(false);
      } catch (e) {
          console.error(e);
      } finally {
          setIsUpgrading(false);
      }
  };

  const handleWhatsAppShare = () => {
      const text = `🏠 *Simulação FinanSmart*
      
💰 Imóvel: ${formatCurrency(data.propertyValue)}
📉 Entrada: ${formatCurrency(data.downPayment)}
🗓 Prazo: ${data.termYears} anos
📊 Taxa: ${data.interestRateAnnual}% a.a.

✅ *1ª Parcela: ${formatCurrency(result.firstInstallment)}*
📉 Última Parcela: ${formatCurrency(result.lastInstallment)}
      
_Gerado por ${user.name}_`;

      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  };

  // Modern Color Palette
  const COLORS = {
    primary: '#6366f1',   // Indigo 500
    secondary: '#cbd5e1', // Slate 300
    accent: '#f59e0b',    // Amber 500 (Interest)
    success: '#10b981',   // Emerald 500
    dark: '#1e293b'       // Slate 800
  };

  // Chart Data Preparation
  const balanceData = result.schedule.filter((_, i) => i % 12 === 0 || i === result.schedule.length - 1).map(row => ({
    name: `${Math.floor(row.month / 12)}º Ano`,
    Saldo: row.balance,
    Juros: row.interest
  }));

  const pieData = [
    { name: 'Valor do Imóvel', value: result.financedAmount, color: COLORS.primary },
    { name: 'Custo de Juros', value: result.totalInterest, color: COLORS.accent },
  ];

  // Comparative Data
  const comparisonData = result.comparison?.isActive ? [
    { name: 'Sem Amortização', Total: result.comparison.originalTotalPaid, color: COLORS.secondary },
    { name: 'Com Estratégia', Total: result.totalPaid, color: COLORS.success },
  ] : [];

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      
      {/* Header Tabs - Compact */}
      <div className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 pt-2 px-3 md:px-6 pb-2">
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg w-full md:w-fit shadow-sm overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('SUMMARY')}
            className={`flex-1 md:flex-none px-2 py-1.5 md:px-4 md:py-2 rounded-md text-[10px] md:text-sm font-medium transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'SUMMARY' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-3 h-3 md:w-4 md:h-4" /> Resumo
          </button>
          <button
            onClick={() => setActiveTab('TABLE')}
            className={`flex-1 md:flex-none px-2 py-1.5 md:px-4 md:py-2 rounded-md text-[10px] md:text-sm font-medium transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'TABLE' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <TableIcon className="w-3 h-3 md:w-4 md:h-4" /> Tabela
          </button>
          <button
            onClick={() => setActiveTab('CHARTS')}
            className={`flex-1 md:flex-none px-2 py-1.5 md:px-4 md:py-2 rounded-md text-[10px] md:text-sm font-medium transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'CHARTS' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <PieIcon className="w-3 h-3 md:w-4 md:h-4" /> Gráficos
          </button>
        </div>
      </div>

      <div className="p-3 md:p-6 flex-1 overflow-y-visible md:overflow-y-auto custom-scrollbar pb-20 md:pb-6">
        
        {/* SUMMARY TAB */}
        {activeTab === 'SUMMARY' && (
          <div className="space-y-3 md:space-y-4 animate-fade-in">
            {/* Credit Analysis Card */}
            <div className={`p-3 md:p-6 rounded-xl border-l-4 shadow-sm bg-white ${result.isCreditApproved ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-2.5 md:gap-4">
                  <div className="flex-shrink-0">
                    {result.isCreditApproved 
                      ? <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" /> 
                      : <XCircle className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
                    }
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-slate-800 leading-tight">
                      {result.isCreditApproved ? 'Crédito Pré-Aprovado' : 'Renda Insuficiente'}
                    </h3>
                    <p className="text-slate-500 text-xs md:text-sm mt-0.5 md:mt-1 leading-relaxed">
                      {result.isCreditApproved 
                        ? 'Sua renda comporta a parcela.' 
                        : `Compromete ${result.incomeCommitmentPercent.toFixed(1)}% da renda.`}
                    </p>
                    {!result.isCreditApproved && (
                      <div className="mt-1.5 md:mt-2 text-[10px] md:text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block">
                        Renda Mín: {formatCurrency(result.requiredMinimumIncome)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex w-full md:w-auto items-center gap-2">
                    {/* Realtor specific: Save Lead Button */}
                    {user.type === 'CORRETOR' && onSaveLead && (
                        <button 
                            onClick={onSaveLead} 
                            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 text-xs md:text-sm font-bold"
                            title="Salvar Cliente"
                        >
                            <Save className="w-4 h-4" />
                            <span className="md:hidden lg:inline">Salvar Lead</span>
                        </button>
                    )}
                    
                    <button 
                        onClick={handleWhatsAppShare} 
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-2 rounded-lg transition-colors border border-emerald-100" 
                        title="Compartilhar WhatsApp"
                    >
                        <MessageCircle className="w-5 h-5" />
                    </button>

                    <button 
                        onClick={handleExport} 
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition-colors border border-slate-200" 
                        title="Baixar PDF"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </div>
              </div>
            </div>

            {/* Smart Amortization Savings Card */}
            {result.comparison?.isActive && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-3 md:p-5 rounded-xl shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>
                <div className="flex items-start gap-2.5 md:gap-3 relative z-10">
                  <div className="p-1.5 md:p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <Zap className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm md:text-lg font-bold text-emerald-900">Economia Projetada</h3>
                    <p className="text-emerald-700 text-[10px] md:text-sm mt-0.5 mb-2">
                      Com {formatCurrency(data.extraAmortizationMonthly || 0)} mensais:
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 md:gap-x-4 md:gap-y-2">
                      <div>
                         <span className="block text-[9px] md:text-[10px] font-semibold uppercase text-emerald-600">Juros Economizados</span>
                         <span className="text-base md:text-xl font-bold text-emerald-800">{formatCurrency(result.comparison.savedInterest)}</span>
                      </div>
                      <div className="w-px bg-emerald-200 hidden md:block"></div>
                      <div>
                         <span className="block text-[9px] md:text-[10px] font-semibold uppercase text-emerald-600">Tempo Reduzido</span>
                         <span className="text-base md:text-xl font-bold text-emerald-800">
                           {Math.floor(result.comparison.savedMonths / 12)}a {result.comparison.savedMonths % 12}m
                         </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
              <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Primeira Parcela
                </div>
                <div className="text-lg md:text-2xl font-bold text-slate-900">{formatCurrency(result.firstInstallment)}</div>
                <div className="text-[9px] md:text-[10px] text-slate-400 mt-0.5">Última: {formatCurrency(result.lastInstallment)}</div>
              </div>
              
              <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3" /> Juros Totais
                </div>
                <div className="text-lg md:text-2xl font-bold text-amber-500">{formatCurrency(result.totalInterest)}</div>
                <div className="text-[9px] md:text-[10px] text-slate-400 mt-0.5">Custo do dinheiro</div>
              </div>

              <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" /> Total Pago
                </div>
                <div className="text-lg md:text-2xl font-bold text-slate-900">{formatCurrency(result.totalPaid)}</div>
                <div className="text-[9px] md:text-[10px] text-slate-400 mt-0.5">Em {result.termMonths} meses</div>
              </div>
            </div>
          </div>
        )}

        {/* CHARTS TAB */}
        {activeTab === 'CHARTS' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in pb-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                
                {/* 1. Area Chart: Balance Evolution */}
                <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm h-64 md:h-80 flex flex-col">
                   <div className="mb-2 md:mb-4">
                      <h3 className="text-xs md:text-sm font-bold text-slate-800">Evolução do Saldo Devedor</h3>
                      <p className="text-[10px] md:text-xs text-slate-400">Decaimento da dívida</p>
                   </div>
                   <div className="flex-1 min-h-0">
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={balanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <defs>
                           <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                             <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                           </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                         <XAxis 
                            dataKey="name" 
                            tick={{fontSize: 9, fill: '#64748b'}} 
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                         />
                         <YAxis 
                            tickFormatter={(val) => `${val/1000}k`} 
                            tick={{fontSize: 9, fill: '#64748b'}} 
                            tickLine={false}
                            axisLine={false}
                         />
                         <Tooltip content={<CustomTooltip />} />
                         <Area 
                            type="monotone" 
                            dataKey="Saldo" 
                            stroke={COLORS.primary} 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorBalance)" 
                         />
                       </AreaChart>
                     </ResponsiveContainer>
                   </div>
                </div>
                
                {/* 2. Bar Chart OR Donut Chart based on State */}
                {result.comparison?.isActive ? (
                   <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm h-64 md:h-80 flex flex-col">
                    <div className="mb-2 md:mb-4">
                      <h3 className="text-xs md:text-sm font-bold text-slate-800">Poder da Amortização</h3>
                      <p className="text-[10px] md:text-xs text-slate-400">Total Pago</p>
                   </div>
                    <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                           <XAxis 
                              dataKey="name" 
                              tick={{fontSize: 9, fill: '#64748b'}} 
                              tickLine={false}
                              axisLine={false}
                           />
                           <YAxis hide />
                           <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                           <Bar dataKey="Total" radius={[6, 6, 0, 0]} barSize={40}>
                              {comparisonData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                           </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm h-64 md:h-80 flex flex-col">
                    <div className="mb-2 md:mb-4">
                      <h3 className="text-xs md:text-sm font-bold text-slate-800">Composição do Custo</h3>
                      <p className="text-[10px] md:text-xs text-slate-400">Imóvel vs. Juros</p>
                    </div>
                    <div className="flex-1 min-h-0 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            iconType="circle"
                            formatter={(value) => <span className="text-[10px] md:text-xs font-semibold text-slate-600 ml-1">{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center Label for Donut */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                         <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Total</span>
                         <span className="text-xs font-bold text-slate-800">{formatCurrency(result.totalPaid)}</span>
                      </div>
                    </div>
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
                       <td className="px-2 py-2 md:px-3 md:py-2.5 text-amber-500">{formatCurrency(row.interest)}</td>
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
                onClick={handleUpgradeWrapper}
                disabled={isUpgrading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                {isUpgrading ? (
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                ) : 'Assinar PRO'}
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
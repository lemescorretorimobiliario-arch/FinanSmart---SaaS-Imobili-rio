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
  Save,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, TooltipProps
} from 'recharts';
import { CalculationResult, SimulationData, UserProfile, MAX_FREE_SIMULATIONS } from '../types';
import { formatCurrency } from '../utils/finance';
import { generatePDF } from '../utils/pdfGenerator';

import PaywallModal from './PaywallModal';

interface ResultDashboardProps {
  data: SimulationData;
  result: CalculationResult;
  user: UserProfile;
  onSaveLead?: () => void;
  onUpgradeClick?: () => Promise<void> | void;
}

// ... existing CustomTooltip ...
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

  const handleExport = () => {
    // If requirement says simulation is blocked, then export should likely also be blocked if free limit reached?
    // Current logic: Free users have limit of 5.
    if (user.plan === 'FREE' && user.simulationsCount >= MAX_FREE_SIMULATIONS) {
      setShowPaywall(true);
      return;
    }
    generatePDF(data, result, user);
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
    <div className="h-full flex flex-col bg-transparent animate-fade-in-up">

      {/* Header Tabs - Premium */}
      <div className="sticky top-0 bg-white/70 backdrop-blur-lg z-10 pt-4 px-4 md:px-8 pb-4 border-b border-slate-200/50">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-full md:w-fit shadow-inner overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('SUMMARY')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'SUMMARY' ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
          >
            <Activity className="w-4 h-4" /> Resumo
          </button>
          <button
            onClick={() => setActiveTab('TABLE')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'TABLE' ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
          >
            <TableIcon className="w-4 h-4" /> Tabela
          </button>
          <button
            onClick={() => setActiveTab('CHARTS')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'CHARTS' ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
          >
            <PieIcon className="w-4 h-4" /> Gráficos
          </button>
        </div>
      </div>

      <div className="p-3 md:p-6 flex-1 overflow-y-visible md:overflow-y-auto custom-scrollbar pb-24 md:pb-6">

        {/* SUMMARY TAB */}
        {activeTab === 'SUMMARY' && (
          <div className="space-y-6 md:space-y-8 animate-fade-in-up">
            {/* Credit Analysis Card */}
            <div className={`p-5 md:p-8 rounded-[2rem] border shadow-xl bg-white relative overflow-hidden group ${result.isCreditApproved ? 'border-emerald-100' : 'border-red-100'}`}>
              <div className={`absolute top-0 left-0 w-2 h-full ${result.isCreditApproved ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
                <div className="flex gap-4 md:gap-6">
                  <div className="flex-shrink-0">
                    {result.isCreditApproved
                      ? <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle className="w-8 h-8" /></div>
                      : <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><XCircle className="w-8 h-8" /></div>
                    }
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-tight">
                      {result.isCreditApproved ? 'Crédito Aprovado' : 'Atenção: Limite de Renda'}
                    </h3>
                    <p className="text-slate-500 font-medium text-xs md:text-sm mt-1 leading-relaxed max-w-sm">
                      {result.isCreditApproved
                        ? 'Sua renda mensal comporta o valor desta parcela.'
                        : `A parcela compromete ${result.incomeCommitmentPercent.toFixed(1)}% da renda.`}
                    </p>
                    {!result.isCreditApproved && (
                      <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2.5 py-1 rounded-lg inline-block border border-red-100">
                        Renda Mín: {formatCurrency(result.requiredMinimumIncome)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex w-full lg:w-auto items-center gap-2">
                  {/* Realtor specific: Save Lead Button */}
                  {user.type === 'CORRETOR' && onSaveLead && (
                    <button
                      onClick={onSaveLead}
                      className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/30 text-[10px] font-black uppercase tracking-widest active:scale-95"
                      title="Salvar Cliente"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar Lead</span>
                    </button>
                  )}

                  <button
                    onClick={handleWhatsAppShare}
                    className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm active:scale-95"
                    title="Compartilhar WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleExport}
                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all border border-slate-200 shadow-sm active:scale-95"
                    title="Baixar PDF"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Amortization Savings Card */}
            {result.comparison?.isActive && (
              <div className="premium-gradient p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10 text-white">
                  <div className="p-4 bg-white/10 backdrop-blur-md rounded-3xl text-yellow-300 shadow-xl border border-white/20">
                    <Zap className="w-8 h-8 md:w-10 md:h-10 fill-yellow-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-black tracking-tight mb-2">Estratégia Inteligente</h3>
                    <p className="text-white/70 font-medium text-sm md:text-base mb-6 max-w-lg leading-relaxed">
                      Ao amortizar <span className="text-white font-bold">{formatCurrency(data.extraAmortizationMonthly || 0)}</span> mensais, você obtém um retorno incrível:
                    </p>
                    <div className="grid grid-cols-2 gap-6 md:gap-10">
                      <div>
                        <span className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Economia Real</span>
                        <span className="text-2xl md:text-4xl font-black text-emerald-400 tracking-tighter">{formatCurrency(result.comparison?.savedInterest || 0)}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Tempo Reduzido</span>
                        <span className="text-2xl md:text-4xl font-black text-blue-300 tracking-tighter">
                          -{Math.floor((result.comparison?.savedMonths || 0) / 12)} anos
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="glass-card p-6 md:p-8 rounded-[2rem] border border-white transition-transform hover:-translate-y-1 group">
                <div className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all"><Calendar className="w-3.5 h-3.5" /></div>
                  Primeira Parcela
                </div>
                <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(result.firstInstallment)}</div>
                <div className="text-[10px] font-bold text-slate-400 mt-2 bg-slate-50 px-2 py-1 rounded-lg w-fit">Final: {formatCurrency(result.lastInstallment)}</div>
              </div>

              <div className="glass-card p-6 md:p-8 rounded-[2rem] border border-white transition-transform hover:-translate-y-1 group">
                <div className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-all"><DollarSign className="w-3.5 h-3.5" /></div>
                  Juros Totais
                </div>
                <div className="text-2xl md:text-3xl font-black text-amber-500 tracking-tight">{formatCurrency(result.totalInterest)}</div>
                <div className="text-[10px] font-bold text-slate-400 mt-2 bg-slate-50 px-2 py-1 rounded-lg w-fit">Custo de capital</div>
              </div>

              <div className="glass-card p-6 md:p-8 rounded-[2rem] border border-white transition-transform hover:-translate-y-1 group">
                <div className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-all"><TrendingUp className="w-3.5 h-3.5" /></div>
                  Total Pago
                </div>
                <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(result.totalPaid)}</div>
                <div className="text-[10px] font-bold text-slate-400 mt-2 bg-slate-50 px-2 py-1 rounded-lg w-fit">Em {result.termMonths} meses</div>
              </div>
            </div>

            {/* Upgrade PRO Banner for Free Users */}
            {user.plan === 'FREE' && (
              <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                  <div className="space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/30 border border-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400">
                      <Star className="w-3 h-3 fill-blue-400" /> Oferta PRO
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight">Desbloqueie o Poder Total</h3>
                    <p className="text-slate-400 font-medium max-w-md">
                      Simulações ilimitadas, PDFs personalizados com sua marca e gestão completa de leads. Tudo por um preço único.
                    </p>
                  </div>
                  <button
                    onClick={onUpgradeClick}
                    className="w-full md:w-auto px-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
                  >
                    Assinar PRO <Zap className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* CHARTS TAB */}
        {activeTab === 'CHARTS' && (
          <div className="space-y-6 md:space-y-8 animate-fade-in-up pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

              {/* 1. Area Chart: Balance Evolution */}
              <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-white h-[350px] md:h-[450px] flex flex-col shadow-xl">
                <div className="mb-6">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Evolução da Dívida</h3>
                  <p className="text-xs text-slate-400 font-medium font-mono">Decaimento do saldo devedor</p>
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={balanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tickFormatter={(val) => `${val / 1000}k`}
                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="Saldo"
                        stroke={COLORS.primary}
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 2. Bar Chart OR Donut Chart based on State */}
              {result.comparison?.isActive ? (
                <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-white h-[350px] md:h-[450px] flex flex-col shadow-xl">
                  <div className="mb-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Poder da Amortização</h3>
                    <p className="text-xs text-slate-400 font-medium font-mono">Diferença no total pago</p>
                  </div>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="Total" radius={[12, 12, 0, 0]} barSize={60}>
                          {comparisonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-white h-[350px] md:h-[450px] flex flex-col shadow-xl">
                  <div className="mb-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Composição do Custo</h3>
                    <p className="text-xs text-slate-400 font-medium font-mono">Imóvel vs. Juros Totais</p>
                  </div>
                  <div className="flex-1 min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={8}
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
                          formatter={(value) => <span className="text-xs font-black text-slate-600 uppercase tracking-widest ml-2">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Label for Donut */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Total</span>
                      <span className="text-xl font-black text-slate-900 tracking-tighter">{formatCurrency(result.totalPaid)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TABLE TAB */}
        {activeTab === 'TABLE' && (
          <div className="glass-card rounded-[2.5rem] border border-white shadow-xl overflow-hidden animate-fade-in-up mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-6 py-5 whitespace-nowrap">Mês</th>
                    <th className="px-6 py-5 whitespace-nowrap">Parcela</th>
                    <th className="px-6 py-5 whitespace-nowrap">Amortização</th>
                    <th className="px-6 py-5 whitespace-nowrap">Juros</th>
                    <th className="px-6 py-5 text-right whitespace-nowrap">Saldo Devedor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.schedule.map((row) => (
                    <tr key={row.month} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 font-black text-slate-400">{row.month}</td>
                      <td className="px-6 py-4 text-slate-900 font-bold">{formatCurrency(row.payment)}</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">{formatCurrency(row.amortization)}</td>
                      <td className="px-6 py-4 text-amber-500 font-medium">{formatCurrency(row.interest)}</td>
                      <td className="px-6 py-4 text-right text-slate-900 font-black tracking-tight">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={onUpgradeClick || (() => { })}
        description="Você atingiu o limite de simulações gratuitas. Exporte relatórios ilimitados com o plano PRO."
      />
    </div>
  );
};

export default ResultDashboard;
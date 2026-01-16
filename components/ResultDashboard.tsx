import React, { useState } from 'react';
import {
  TrendingDown, TrendingUp, Calendar, DollarSign, Clock, Zap,
  ArrowRight, Download, Share2, Info, CheckCircle, XCircle,
  MessageCircle, Save, Star, ChevronDown, ChevronUp, PieChart as PieChartIcon,
  Table as TableIcon, LayoutDashboard, Calculator
} from 'lucide-react';
import { CalculationResult, SimulationData, UserPlan, InstallmentRow } from '../types';
import { SYSTEM_LIMITS, UserRole } from '../core/system';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { generatePDF } from '../utils/pdfGenerator';
import { toast } from 'sonner';

interface ResultDashboardProps {
  result: CalculationResult;
  data: SimulationData;
  user: any;
  onSaveLead?: () => void;
  onUpgrade?: () => void;
}

const ResultDashboard: React.FC<ResultDashboardProps> = ({ result, data, user, onSaveLead, onUpgrade }) => {
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'CHARTS' | 'EVOLUTION'>('SUMMARY');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const chartData = result.schedule.slice(0, 120).map((item, index) => ({
    mes: index,
    saldo: item.balance,
    parcela: item.payment,
    juros: item.interest,
    amortizacao: item.amortization
  }));

  const pieData = [
    { name: 'Principal', value: result.financedAmount },
    { name: 'Juros Totais', value: result.totalInterest }
  ];

  const handleExport = async () => {
    if (user.plan === UserPlan.FREE) {
      toast.error("Upgrade para PRO necessário para exportar PDF.");
      onUpgrade?.();
      return;
    }

    const toastId = toast.loading("Gerando relatório profissional...");
    try {
      await generatePDF(data, result, user);
      toast.success("Relatório gerado com sucesso!", { id: toastId });
    } catch (error) {
      toast.error("Erro ao gerar PDF", { id: toastId });
    }
  };

  const handleWhatsAppShare = () => {
    const text = `Simulação FinanSmart: 
🏦 Imóvel: ${formatCurrency(data.propertyValue)}
💰 Parcela: ${formatCurrency(result.firstInstallment)}
⏱️ Prazo: ${data.termYears} anos
📊 Taxa: ${data.interestRateAnnual}% a.a.

Simule grátis em: ${window.location.origin}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Navigation Tabs - Compact */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 flex-shrink-0 z-30">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="p-1 sm:p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingDown className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">Resultado da Simulação</h2>
          </div>
          <div className="flex gap-1.5 sm:gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50"
              title="Compartilhar WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={handleExport}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
              title="Exportar PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'SUMMARY' as const, label: 'Resumo', icon: LayoutDashboard },
            { id: 'CHARTS' as const, label: 'Gráficos', icon: PieChartIcon },
            { id: 'EVOLUTION' as const, label: 'Evolução', icon: TableIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 pb-2.5 sm:pb-3 px-0.5 sm:px-1 text-[10px] sm:text-xs font-bold transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
              {activeTab === tab.id && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6 flex-1 overflow-y-auto custom-scrollbar no-scrollbar">
        {activeTab === 'SUMMARY' && (
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 md:space-y-6 animate-fade-in-up">

            {/* Main Result: Installment */}
            <div className="finan-card-premium p-4 sm:p-5 md:p-6 lg:p-8 border-l-4 border-l-blue-600 relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-5 hidden md:block">
                <Calculator className="w-16 md:w-20 lg:w-24 h-16 md:h-20 lg:h-24" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5 md:gap-6">
                <div>
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded border border-blue-100 mb-1 sm:mb-1.5 inline-block">
                    Parcela Mensal (1ª)
                  </span>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
                    {formatCurrency(result.firstInstallment)}
                  </h1>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 leading-relaxed max-w-xs">
                    {data.amortizationSystem === 'SAC' ? 'As parcelas diminuem ao longo do tempo conforme o saldo devedor é amortizado.' : 'As parcelas permanecem fixas durante todo o contrato.'}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${result.isCreditApproved ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                    {result.isCreditApproved ? <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> : <XCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-tight">
                      {result.isCreditApproved ? 'Crédito Recomendado' : 'Renda Insuficiente'}
                    </span>
                  </div>
                  {user.type === UserRole.CORRETOR && onSaveLead && (
                    <button onClick={onSaveLead} className="btn-primary w-full py-2.5">
                      <Save className="w-3.5 h-3.5" />
                      Salvar Lead
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Strategy Highlights */}
            {result.comparison?.isActive && (
              <div className="bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white relative overflow-hidden shadow-xl ring-1 ring-white/10">
                <div className="absolute right-[-20px] top-[-20px] w-32 sm:w-40 h-32 sm:h-40 bg-blue-600/30 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded flex items-center justify-center">
                      <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-blue-200" />
                    </div>
                    <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-400">Poder da Amortização</h3>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-300 mb-4 sm:mb-5 md:mb-6">
                    Com um aporte mensal de <span className="text-white font-bold">{formatCurrency(data.extraAmortizationMonthly || 0)}</span>, você economizará uma fortuna em juros bancários.
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <span className="block text-[9px] sm:text-[10px] uppercase text-slate-500 font-bold mb-1">Economia Total</span>
                      <span className="text-lg sm:text-xl md:text-2xl font-black text-emerald-400">{formatCurrency(result.comparison?.savedInterest || 0)}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] sm:text-[10px] uppercase text-slate-500 font-bold mb-1">Redução de Prazo</span>
                      <span className="text-lg sm:text-xl md:text-2xl font-black text-blue-400">-{Math.floor((result.comparison?.savedMonths || 0) / 12)} anos</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Secondary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="finan-card p-4 sm:p-5">
                <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 mb-2 sm:mb-3">
                  <DollarSign className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest leading-none">Total Pago</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-slate-800">{formatCurrency(result.totalPaid)}</div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 mt-1">Imóvel + Juros bancários</div>
              </div>

              <div className="finan-card p-4 sm:p-5">
                <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 mb-2 sm:mb-3">
                  <TrendingUp className="w-3.5 h-3.5 font-bold" />
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Juros Totais</span>
                </div>
                <div className="text-xl font-bold text-red-600">{formatCurrency(result.totalInterest)}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {((result.totalInterest / result.financedAmount) * 100).toFixed(0)}% do valor financiado
                </div>
              </div>

              <div className="finan-card p-5">
                <div className="flex items-center gap-2 text-slate-400 mb-3">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Última Parcela</span>
                </div>
                <div className="text-xl font-bold text-slate-800">
                  {formatCurrency(result.lastInstallment)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Em {data.termYears} anos</div>
              </div>
            </div>

            {/* Additional Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="finan-card p-5 bg-slate-50/50">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                  <Info className="w-3 h-3" /> Distribuição dos Custos
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Valor do Imóvel</span>
                    <span className="font-bold">{formatCurrency(data.propertyValue)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Valor Financiado</span>
                    <span className="font-bold">{formatCurrency(result.financedAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Juros Médios ao Mês</span>
                    <span className="font-bold">{(data.interestRateAnnual / 12).toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className="finan-card p-5">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">Comprometimento de Renda</h4>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div><span className="text-[10px] font-bold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">{result.incomeCommitmentPercent.toFixed(1)}%</span></div>
                    <div className="text-right"><span className="text-[10px] font-bold inline-block text-blue-600">Limite 30%</span></div>
                  </div>
                  <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded bg-blue-100">
                    <div style={{ width: `${Math.min(100, (result.incomeCommitmentPercent / 30) * 100)}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${result.incomeCommitmentPercent > 30 ? 'bg-red-500' : 'bg-blue-600'}`}></div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Bancos costumam limitar a parcela a 30% da sua renda bruta comprovada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHARTS TAB - Compact version */}
        {activeTab === 'CHARTS' && (
          <div className="space-y-4 sm:space-y-5 md:space-y-6 max-w-4xl mx-auto animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <div className="finan-card p-4 sm:p-5 md:p-6">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-4 sm:mb-5 md:mb-6">Composição Total</h3>
                <div className="h-[180px] sm:h-[200px] md:h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="finan-card p-4 sm:p-5 md:p-6">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-4 sm:mb-5 md:mb-6">Evolução da Parcela</h3>
                <div className="h-[180px] sm:h-[200px] md:h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorParcela" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="mes" hide />
                      <YAxis hide />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Area type="monotone" dataKey="parcela" stroke="#2563eb" fillOpacity={1} fill="url(#colorParcela)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EVOLUTION TAB - Compact scroll table */}
        {activeTab === 'EVOLUTION' && (
          <div className="finan-card animate-fade-in-up overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase text-slate-500">Mês</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase text-slate-500">Parcela</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase text-slate-500">Juros</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase text-slate-500">Amort.</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase text-slate-500">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 italic font-medium">
                  {result.schedule.filter((_, i) => i % 12 === 0 || i === result.schedule.length - 1).map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-2.5 text-xs text-slate-900">Mês {i * 12}</td>
                      <td className="px-4 py-2.5 text-xs font-bold text-slate-900">{formatCurrency(item.payment)}</td>
                      <td className="px-4 py-2.5 text-xs text-red-500">{formatCurrency(item.interest)}</td>
                      <td className="px-4 py-2.5 text-xs text-emerald-600">{formatCurrency(item.amortization)}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">{formatCurrency(item.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50 text-[10px] text-center text-slate-400 font-medium">
              Mostrando resumo anual para facilitar a leitura.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDashboard;
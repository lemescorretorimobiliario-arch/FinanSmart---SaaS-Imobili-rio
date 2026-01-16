import React, { useState, useEffect, useRef } from 'react';
import { SimulationData, UserProfile } from '../types';
import { formatCurrency, parseCurrency, calculateEstimatedMinimumIncome } from '../utils/finance';
import {
  Calculator, DollarSign, Percent, Calendar, Home, Briefcase,
  Landmark, Zap, ArrowRight, ArrowLeft, CheckCircle, HelpCircle,
  TrendingDown, Star, ChevronRight
} from 'lucide-react';

interface Props {
  data: SimulationData;
  onChange: (data: SimulationData) => void;
  onSimulate: () => void;
  user?: UserProfile | null;
}

// Condensed steps for better UX
const steps = [
  { id: 1, label: 'Dados Financeiros' },
  { id: 2, label: 'Condições do Crédito' },
  { id: 3, label: 'Otimização' },
];

const InfoTooltip = ({ text }: { text: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-1 align-middle">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-slate-300 hover:text-blue-500 transition-colors focus:outline-none"
      >
        <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg z-50 animate-fade-in pointer-events-none">
          <p className="leading-tight">{text}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
};

const CalculatorForm: React.FC<Props> = ({ data, onChange, onSimulate, user }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if configured
  }, []);

  const updateField = (field: keyof SimulationData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleCurrencyChange = (field: keyof SimulationData, value: string) => {
    updateField(field, parseCurrency(value));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onSimulate();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Estimate min income automatically
  const estimatedMinIncome = Math.ceil(calculateEstimatedMinimumIncome(
    data.propertyValue,
    data.downPayment,
    data.termYears,
    data.interestRateAnnual
  ));

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="bg-transparent md:h-full flex flex-col h-full relative animate-fade-in-up">
      {/* Progress Header - Premium Compact */}
      <div className="px-5 py-3 md:px-6 md:py-3 border-b border-slate-200/50 flex-shrink-0 bg-white/70 backdrop-blur-lg rounded-t-2xl">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            Etapa {currentStep}/{steps.length}
          </span>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            {steps[currentStep - 1].label}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full premium-gradient rounded-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-5 py-5 md:px-8 md:py-6 custom-scrollbar pb-24 md:pb-6">
        <div className="max-w-sm mx-auto space-y-6 animate-fade-in-up">

          {/* --- PASSO 1: DADOS FINANCEIROS --- */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-2xl border border-slate-100 group transition-all hover:border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all"><Home className="w-3.5 h-3.5" /></div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Valor do Imóvel</label>
                </div>
                <input
                  type="text"
                  value={formatCurrency(data.propertyValue)}
                  onChange={(e) => handleCurrencyChange('propertyValue', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-lg font-black text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="bg-white/50 p-4 rounded-2xl border border-slate-100 group transition-all hover:border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all"><DollarSign className="w-3.5 h-3.5" /></div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Entrada</label>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateField('downPayment', data.propertyValue * 0.2)} className="text-[8px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm">20%</button>
                    <button onClick={() => updateField('downPayment', data.propertyValue * 0.5)} className="text-[8px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm">50%</button>
                  </div>
                </div>
                <input
                  type="text"
                  value={formatCurrency(data.downPayment)}
                  onChange={(e) => handleCurrencyChange('downPayment', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-lg font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="glass-card p-5 rounded-[1.5rem] border border-white shadow-lg group transition-all hover:border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all"><Briefcase className="w-4 h-4" /></div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Renda Familiar</label>
                </div>
                <input
                  type="text"
                  value={formatCurrency(data.monthlyIncome)}
                  onChange={(e) => handleCurrencyChange('monthlyIncome', e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xl font-black text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-inner"
                />
                <div className="mt-4 text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Sugerido: <span className="text-slate-900">{formatCurrency(estimatedMinIncome)}</span>
                </div>
              </div>
            </div>
          )}

          {/* --- PASSO 2: CONDIÇÕES DO CRÉDITO --- */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="glass-card p-5 rounded-[1.5rem] border border-white shadow-lg group transition-all hover:border-indigo-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><Calendar className="w-4 h-4" /></div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prazo do Financiamento</label>
                  </div>
                  <span className="text-lg font-black text-indigo-600 tracking-tight bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">{data.termYears} Anos</span>
                </div>
                <div className="px-2">
                  <input
                    type="range"
                    min="5"
                    max="35"
                    value={data.termYears}
                    onChange={(e) => updateField('termYears', Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 shadow-inner"
                  />
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-300 mt-3">
                    <span>5 anos</span>
                    <span>35 anos</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-5 rounded-[1.5rem] border border-white shadow-lg group transition-all hover:border-blue-200">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Juros do Banco (% a.a.)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={data.interestRateAnnual}
                      onChange={(e) => updateField('interestRateAnnual', Number(e.target.value))}
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-slate-900 text-lg shadow-inner transition-all"
                    />
                    <Percent className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  </div>
                </div>

                <div className="glass-card p-5 rounded-[1.5rem] border border-white shadow-lg group transition-all hover:border-blue-200">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Tipo de Parcela</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/50">
                    <button
                      onClick={() => updateField('amortizationSystem', 'SAC')}
                      className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${data.amortizationSystem === 'SAC' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      title="Parcelas começam maiores e diminuem com o tempo."
                    >
                      Decrescente (SAC)
                    </button>
                    <button
                      onClick={() => updateField('amortizationSystem', 'PRICE')}
                      className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${data.amortizationSystem === 'PRICE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      title="Parcelas fixas do início ao fim."
                    >
                      Fixas (PRICE)
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-[9px] font-black uppercase tracking-widest text-center text-slate-400 bg-white/50 p-3 rounded-[1.5rem] border border-slate-100">
                💡 Dica: Clique nos bancos no topo para preencher a taxa.
              </div>
            </div>
          )}

          {/* --- PASSO 3: OTIMIZAÇÃO (EXTRA) --- */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center group">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-100 shadow-lg group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                  <Zap className="w-8 h-8 fill-amber-300" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Potencialize sua Economia</h3>
                <p className="text-slate-500 font-medium text-xs mt-1.5 max-w-[240px] mx-auto">Adicionar um valor extra na parcela abate juros de forma estratégica.</p>
              </div>

              <div className="glass-card p-5 md:p-6 rounded-[1.5rem] border-2 border-amber-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>

                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Pagamento Extra Mensal (Economia)</label>
                <div className="relative mb-5">
                  <input
                    type="text"
                    value={formatCurrency(data.extraAmortizationMonthly || 0)}
                    onChange={(e) => handleCurrencyChange('extraAmortizationMonthly', e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-black text-slate-900 text-2xl shadow-inner transition-all"
                    placeholder="R$ 0,00"
                  />
                </div>

                {data.extraAmortizationMonthly && data.extraAmortizationMonthly > 0 ? (
                  <div className="flex gap-4">
                    <button
                      onClick={() => updateField('extraAmortizationStrategy', 'REDUCE_TERM')}
                      className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 transition-all flex flex-col items-center gap-1 shadow-sm ${(data.extraAmortizationStrategy || 'REDUCE_TERM') === 'REDUCE_TERM'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-amber-500/20'
                        : 'bg-white text-slate-400 border-slate-100 hover:border-amber-200'
                        }`}
                    >
                      <span>Reduzir Prazo</span>
                      <span className="text-[8px] font-bold opacity-80">(Máxima Economia)</span>
                    </button>
                    <button
                      onClick={() => updateField('extraAmortizationStrategy', 'REDUCE_INSTALLMENT')}
                      className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 transition-all flex flex-col items-center gap-1 shadow-sm ${data.extraAmortizationStrategy === 'REDUCE_INSTALLMENT'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-amber-500/20'
                        : 'bg-white text-slate-400 border-slate-100 hover:border-amber-200'
                        }`}
                    >
                      <span>Reduzir Parcela</span>
                      <span className="text-[8px] font-bold opacity-80">(Alívio no Caixa)</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => updateField('extraAmortizationMonthly', 500)}
                    className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-[1.5rem] transition-all border-2 border-amber-200 border-dashed active:scale-95 shadow-sm"
                  >
                    Testar com R$ 500,00 mensais
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer Actions - Premium Scaled Down */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 border-t border-slate-200/50 flex justify-between items-center bg-white/80 backdrop-blur-xl flex-shrink-0 z-30 rounded-b-[1.5rem]">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`group flex items-center gap-2 px-4 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${currentStep === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 active:scale-95'
            }`}
        >
          <div className="p-1 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-all"><ArrowLeft className="w-3.5 h-3.5" /></div>
          <span>Voltar</span>
        </button>

        <button
          onClick={nextStep}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl shadow-blue-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Subtle PRO CTA for Free Users */}
      {user && user.plan === 'FREE' && (
        <div className="px-6 py-3 bg-amber-50/50 border-t border-amber-100 flex items-center justify-between group cursor-pointer hover:bg-amber-100 transition-all">
          <div className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">Simule sem limites com o Plano PRO</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </div>
  );
};

export default CalculatorForm;

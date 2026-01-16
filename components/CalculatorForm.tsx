import React from 'react';
import { Home, Calendar, DollarSign, Percent, Zap, ArrowRight, ArrowLeft, Info, Briefcase, CheckCircle } from 'lucide-react';
import { SimulationData } from '../types';
import { UserRole } from '../core/system';
import BankCarousel from './BankCarousel';

interface CalculatorFormProps {
  data: SimulationData;
  onChange: (data: SimulationData) => void;
  onSimulate: () => void;
  user: any;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ data, onChange, onSimulate, user }) => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const steps = [
    { id: 1, label: 'Patrimônio', icon: Home },
    { id: 2, label: 'Crédito', icon: Calendar },
    { id: 3, label: 'Estratégia', icon: Zap }
  ];

  const updateField = (field: keyof SimulationData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleCurrencyChange = (field: keyof SimulationData, value: string) => {
    const numericValue = Number(value.replace(/\D/g, '')) / 100;
    updateField(field, numericValue);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const progress = (currentStep / steps.length) * 100;

  // Cálculo de Renda Mínima Estimada (30% da parcela aproximada)
  const estimatedLoan = data.propertyValue - data.downPayment;
  const monthlyRateApproximated = (data.interestRateAnnual / 100) / 12;
  const totalMonths = data.termYears * 12;
  const approxPayment = estimatedLoan * (monthlyRateApproximated / (1 - Math.pow(1 + monthlyRateApproximated, -totalMonths)));
  const estimatedMinIncome = approxPayment / 0.3;

  return (
    <div className="md:h-full flex flex-col h-full relative">
      {/* Progress Header */}
      <div className="px-5 py-3 border-b border-slate-200 flex-shrink-0 bg-white z-20">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              {currentStep}/{steps.length}
            </span>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">
              {steps[currentStep - 1].label}
            </span>
          </div>
          <div className="flex gap-1">
            {steps.map(s => (
              <div key={s.id} className={`w-1.5 h-1.5 rounded-full transition-colors ${s.id === currentStep ? 'bg-blue-600' : s.id < currentStep ? 'bg-blue-200' : 'bg-slate-100'}`} />
            ))}
          </div>
        </div>
        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar pb-24 md:pb-6">
        <div className="max-w-[340px] mx-auto space-y-5 animate-fade-in-up">

          {/* PASSO 1 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="finan-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-3.5 h-3.5 text-slate-400" />
                  <label className="text-[11px] font-bold uppercase tracking-tight text-slate-500">Valor do Imóvel</label>
                </div>
                <input
                  type="text"
                  value={formatCurrency(data.propertyValue)}
                  onChange={(e) => handleCurrencyChange('propertyValue', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-base font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="finan-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <label className="text-[11px] font-bold uppercase tracking-tight text-slate-500">Entrada</label>
                  </div>
                  <div className="flex gap-1.5">
                    {[0.2, 0.5].map(p => (
                      <button
                        key={p}
                        onClick={() => updateField('downPayment', data.propertyValue * p)}
                        className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded hover:bg-blue-600 hover:text-white transition-all"
                      >
                        {p * 100}%
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={formatCurrency(data.downPayment)}
                  onChange={(e) => handleCurrencyChange('downPayment', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-base font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="finan-card p-4 border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <label className="text-[11px] font-bold uppercase tracking-tight text-slate-500">Renda Mensal</label>
                </div>
                <input
                  type="text"
                  value={formatCurrency(data.monthlyIncome)}
                  onChange={(e) => handleCurrencyChange('monthlyIncome', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-base font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <div className="mt-2.5 flex items-center gap-2 text-[10px] text-slate-500 leading-tight">
                  <Info className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  <span>Mínimo sugerido: <b className="text-slate-900">{formatCurrency(estimatedMinIncome)}</b></span>
                </div>
              </div>
            </div>
          )}

          {/* PASSO 2 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="finan-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <label className="text-[11px] font-bold uppercase tracking-tight text-slate-500">Prazo anos</label>
                  </div>
                  <span className="text-sm font-bold text-blue-600">{data.termYears} Anos</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={data.termYears}
                  onChange={(e) => updateField('termYears', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                  <span>20</span>
                  <span>25</span>
                  <span>30</span>
                  <span>35</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="finan-card p-4">
                  <label className="text-[11px] font-bold uppercase tracking-tight text-slate-500 mb-2 block">Taxa (% a.a.)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={data.interestRateAnnual}
                      onChange={(e) => updateField('interestRateAnnual', Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-3 pr-7 py-2 text-base font-bold text-slate-900 outline-none"
                    />
                    <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  </div>
                </div>

                <div className="finan-card p-4">
                  <label className="text-[11px] font-bold uppercase tracking-tight text-slate-500 mb-2 block">Amortização</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => updateField('amortizationSystem', 'SAC')}
                      className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded-md transition-all ${data.amortizationSystem === 'SAC' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      SAC
                    </button>
                    <button
                      onClick={() => updateField('amortizationSystem', 'PRICE')}
                      className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded-md transition-all ${data.amortizationSystem === 'PRICE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      PRICE
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-[11px] text-slate-500 font-medium">💡 Escolha um banco acima para aplicar taxas reais</p>
              </div>
            </div>
          )}

          {/* PASSO 3 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center pb-2">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-5 h-5 fill-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Economia Inteligente</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">Quanto mais você paga por mês além da parcela, menos juros pagará ao final.</p>
              </div>

              <div className="finan-card p-5 border-blue-200 bg-blue-50/10">
                <label className="text-[11px] font-bold uppercase tracking-tight text-slate-500 mb-2 block text-center">Aporte Extra Mensal</label>
                <input
                  type="text"
                  value={formatCurrency(data.extraAmortizationMonthly || 0)}
                  onChange={(e) => handleCurrencyChange('extraAmortizationMonthly', e.target.value)}
                  className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-xl font-bold text-center text-blue-600 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[200, 500, 1000, 2000].map(val => (
                  <button
                    key={val}
                    onClick={() => updateField('extraAmortizationMonthly', val)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${data.extraAmortizationMonthly === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                  >
                    +{formatCurrency(val)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="px-5 py-4 border-t border-slate-200 bg-white/80 backdrop-blur-md sticky bottom-0 z-30">
        <div className="flex gap-3 max-w-[340px] mx-auto">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              className="flex-1 btn-primary py-3 rounded-xl"
            >
              Próximo Passo
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onSimulate}
              className={`flex-1 ${user ? 'premium-gradient' : 'bg-slate-900'} text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2`}
            >
              {user ? 'Simular Agora' : 'Login para Simular'}
              {user ? (
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculatorForm;

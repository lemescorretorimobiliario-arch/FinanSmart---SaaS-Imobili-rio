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
    { id: 1, label: 'Patrimônio', icon: Home, subtitle: 'Valor e Entrada' },
    { id: 2, label: 'Crédito', icon: Calendar, subtitle: 'Condições do Financiamento' },
    { id: 3, label: 'Estratégia', icon: Zap, subtitle: 'Potencialize sua Economia' }
  ];

  const updateField = (field: keyof SimulationData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleCurrencyChange = (field: keyof SimulationData, value: string) => {
    const numericValue = Number(value.replace(/\D/g, '')) / 100;
    updateField(field, numericValue);
  };

  const formatCurrencyValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const progress = (currentStep / steps.length) * 100;

  return (

    <div className="h-full flex flex-col bg-white">
      {/* HEADER: PROGRESS INDICATOR - Responsive Padding */}
      <div className="px-4 md:px-6 py-3 border-b border-slate-100 flex-shrink-0 bg-white/80 backdrop-blur-sm z-20">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {steps[currentStep - 1].label}
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50 uppercase tracking-wider">
            Etapa {currentStep} de 3
          </span>
        </div>
        <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* BODY: FORM CONTENT - Responsive Padding & Max Width */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 custom-scrollbar scroll-smooth">
        <div className="w-full max-w-md mx-auto">

          {/* PASSO 1: PATRIMÔNIO */}
          {currentStep === 1 && (
            <div className="space-y-5 md:space-y-6 animate-fade-in-up">
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-slate-900">Planejamento Patrimonial</h2>
                <p className="text-sm text-slate-500 mt-1">Defina os valores base para o seu financiamento</p>
              </div>

              <div className="finan-card-premium p-4 md:p-5">
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider block mb-2">Valor do Imóvel</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formatCurrencyValue(data.propertyValue)}
                        onChange={(e) => handleCurrencyChange('propertyValue', e.target.value)}
                        className="w-full text-lg md:text-xl font-bold text-slate-900 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Entrada</label>
                      <span className="text-xs font-bold text-blue-600 px-1.5 rounded bg-blue-50">{Math.round((data.downPayment / data.propertyValue) * 100)}%</span>
                    </div>
                    <input
                      type="text"
                      value={formatCurrencyValue(data.downPayment)}
                      onChange={(e) => handleCurrencyChange('downPayment', e.target.value)}
                      className="w-full text-base md:text-lg font-bold text-slate-900 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl flex gap-3 items-start">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Recomendamos no mínimo 20% de entrada para garantir as melhores taxas de aprovação bancária.
                </p>
              </div>
            </div>
          )}

          {/* PASSO 2: CRÉDITO */}
          {currentStep === 2 && (
            <div className="space-y-5 md:space-y-6 animate-fade-in-up">
              <div className="finan-card p-4 md:p-5 border-slate-200/60">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-xs font-bold uppercase text-slate-600 tracking-wider px-2 py-1 bg-slate-100 rounded-md">Prazo</label>
                  <span className="text-base font-bold text-indigo-600">{data.termYears} anos</span>
                </div>

                <input
                  type="range"
                  min="5"
                  max="35"
                  value={data.termYears}
                  onChange={(e) => updateField('termYears', Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold uppercase">
                  <span>5 anos</span>
                  <span>35 anos</span>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                <div className="finan-card p-3 md:p-4">
                  <label className="text-[10px] md:text-xs font-bold uppercase text-slate-500 mb-2 block">Taxa Juros</label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                    <input
                      type="number"
                      step="0.1"
                      value={data.interestRateAnnual}
                      onChange={(e) => updateField('interestRateAnnual', Number(e.target.value))}
                      className="w-full text-sm md:text-base font-bold text-slate-900 bg-transparent focus:outline-none"
                    />
                    <Percent className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                <div className="finan-card p-3 md:p-4">
                  <label className="text-[10px] md:text-xs font-bold uppercase text-slate-500 mb-2 block">Amortização</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 h-[38px]">
                    <button
                      onClick={() => updateField('amortizationSystem', 'SAC')}
                      className={`flex-1 text-[10px] md:text-xs font-bold uppercase rounded-md transition-all ${data.amortizationSystem === 'SAC' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      SAC
                    </button>
                    <button
                      onClick={() => updateField('amortizationSystem', 'PRICE')}
                      className={`flex-1 text-[10px] md:text-xs font-bold uppercase rounded-md transition-all ${data.amortizationSystem === 'PRICE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      PRICE
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50/50 border border-amber-100/50 rounded-xl flex gap-3 items-center">
                <Info className="w-4 h-4 text-amber-500" />
                <p className="text-xs text-amber-800 leading-tight font-medium">
                  Selecione um banco no topo para aplicar as taxas automaticamente.
                </p>
              </div>
            </div>
          )}

          {/* PASSO 3: OTIMIZAÇÃO (ESTRATÉGIA) */}
          {currentStep === 3 && (
            <div className="space-y-5 md:space-y-6 animate-fade-in-up">
              <div className="text-center pt-2">
                <h2 className="text-lg font-bold text-slate-900">Estratégia de Quitação</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Acelere sua liberdade financeira com amortizações extras.
                </p>
              </div>

              <div className="finan-card-premium p-5 border-blue-100/50">
                <label className="text-xs font-bold uppercase text-blue-600 tracking-wider mb-3 block text-center">Aporte Mensal Adicional</label>
                <input
                  type="text"
                  value={formatCurrencyValue(data.extraAmortizationMonthly || 0)}
                  onChange={(e) => handleCurrencyChange('extraAmortizationMonthly', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl text-2xl font-bold text-slate-900 text-center py-3 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[500, 1000].map(val => (
                  <button
                    key={val}
                    onClick={() => updateField('extraAmortizationMonthly', val)}
                    className="group border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 rounded-xl p-3 bg-white transition-all shadow-sm"
                  >
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 block uppercase tracking-tight mb-0.5">Simular</span>
                    <span className="text-sm font-bold text-slate-600 group-hover:text-blue-700">+{formatCurrencyValue(val)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER: NAVIGATION */}
      <div className="px-4 md:px-6 py-4 border-t border-slate-50 bg-white">
        <div className="flex gap-3 max-w-md mx-auto items-center">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              className="flex-1 bg-slate-900 text-white h-12 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-slate-800"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onSimulate}
              className={`flex-1 ${user ? 'premium-gradient' : 'bg-slate-900'} text-white h-12 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:opacity-90`}
            >
              {user ? 'Ver Resultado' : 'Login para Simular'}
              {user && <CheckCircle className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculatorForm;

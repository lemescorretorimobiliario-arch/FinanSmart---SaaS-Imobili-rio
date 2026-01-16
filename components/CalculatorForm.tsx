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
      {/* HEADER: PROGRESS INDICATOR */}
      <div className="px-5 py-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-blue-100/50">
            Etapa {currentStep} de 3
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            {steps[currentStep - 1].label}
          </span>
        </div>
        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* BODY: FORM CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar scroll-smooth">
        <div className="max-w-[360px] mx-auto">

          {/* PASSO 1: PATRIMÔNIO */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-100 shadow-sm">
                  <Home className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Valor do Imóvel</h2>
                <p className="text-[10px] text-slate-500 mt-1">Quanto vale o imóvel dos seus sonhos?</p>
              </div>

              <div className="finan-card-premium p-5 text-center">
                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest block mb-2">Valor de Avaliação</label>
                <input
                  type="text"
                  value={formatCurrencyValue(data.propertyValue)}
                  onChange={(e) => handleCurrencyChange('propertyValue', e.target.value)}
                  className="w-full text-xl font-black text-slate-900 text-center focus:outline-none placeholder-slate-200"
                />
              </div>

              <div className="finan-card p-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-tight">Entrada Mínima</label>
                  <span className="text-[10px] font-bold text-blue-600">{Math.round((data.downPayment / data.propertyValue) * 100)}%</span>
                </div>
                <input
                  type="text"
                  value={formatCurrencyValue(data.downPayment)}
                  onChange={(e) => handleCurrencyChange('downPayment', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-base font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* PASSO 2: CRÉDITO */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="finan-card-premium p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest block">Prazo do Financiamento</label>
                    <span className="text-lg font-black text-indigo-600">{data.termYears} Anos</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="5"
                  max="35"
                  value={data.termYears}
                  onChange={(e) => updateField('termYears', Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-3 font-bold">
                  <span>5 ANOS</span>
                  <span>35 ANOS</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="finan-card p-4">
                  <label className="text-[9px] font-bold uppercase text-slate-400 mb-2 block">Juros (% a.a.)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={data.interestRateAnnual}
                      onChange={(e) => updateField('interestRateAnnual', Number(e.target.value))}
                      className="w-full text-lg font-black text-slate-900 focus:outline-none"
                    />
                    <Percent className="w-3 h-3 text-slate-300" />
                  </div>
                </div>

                <div className="finan-card p-4">
                  <label className="text-[9px] font-bold uppercase text-slate-400 mb-2 block">Parcelas</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => updateField('amortizationSystem', 'SAC')}
                      className={`flex-1 py-1 text-[8px] font-black uppercase rounded-md transition-all ${data.amortizationSystem === 'SAC' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400'}`}
                    >
                      SAC
                    </button>
                    <button
                      onClick={() => updateField('amortizationSystem', 'PRICE')}
                      className={`flex-1 py-1 text-[8px] font-black uppercase rounded-md transition-all ${data.amortizationSystem === 'PRICE' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400'}`}
                    >
                      PRICE
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-4 flex gap-3 items-center">
                <Info className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[11px] text-amber-700 leading-tight font-medium">
                  <strong>Dica:</strong> Explore os bancos no topo para carregar taxas oficiais atualizadas.
                </p>
              </div>
            </div>
          )}

          {/* PASSO 3: OTIMIZAÇÃO (ESTRATÉGIA) */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in-up text-center">
              <div className="pt-2">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20 rotate-3">
                  <Zap className="w-8 h-8 fill-white" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Economia Inteligente</h2>
                <p className="text-xs text-slate-500 mt-2 max-w-[240px] mx-auto leading-relaxed">
                  Adicionar um valor extra mensal abate juros e reduz o tempo de forma estratégica.
                </p>
              </div>

              <div className="finan-card-premium p-8 border-amber-200 bg-amber-50/10 ring-4 ring-amber-500/[0.03]">
                <label className="text-[10px] font-black uppercase text-amber-600 tracking-[0.2em] mb-4 block">Aporte Mensal Extra</label>
                <input
                  type="text"
                  value={formatCurrencyValue(data.extraAmortizationMonthly || 0)}
                  onChange={(e) => handleCurrencyChange('extraAmortizationMonthly', e.target.value)}
                  className="w-full bg-transparent text-3xl font-black text-slate-900 text-center focus:outline-none"
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[500, 1000].map(val => (
                  <button
                    key={val}
                    onClick={() => updateField('extraAmortizationMonthly', val)}
                    className="group relative px-4 py-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300"
                  >
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600 block uppercase tracking-tighter">Testar com</span>
                    <span className="text-base font-black text-slate-600 group-hover:text-blue-700">+{formatCurrencyValue(val)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER: NAVIGATION */}
      <div className="px-6 py-6 border-t border-slate-100 bg-white/50 backdrop-blur-md">
        <div className="flex gap-4 max-w-[360px] mx-auto items-center">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-all active:scale-90"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              className="flex-1 bg-slate-900 text-white h-12 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
            >
              Próximo Passo
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onSimulate}
              className={`flex-1 ${user ? 'premium-gradient shadow-blue-600/20' : 'bg-slate-900'} text-white h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all animate-pulse-subtle`}
            >
              {user ? 'Simular Agora' : 'Login para Simular'}
              {user ? (
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculatorForm;

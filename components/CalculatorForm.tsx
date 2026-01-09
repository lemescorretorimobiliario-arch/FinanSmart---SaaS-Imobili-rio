import React, { useState, useEffect, useRef } from 'react';
import { SimulationData } from '../types';
import { formatCurrency, parseCurrency, calculateEstimatedMinimumIncome } from '../utils/finance';
import { 
  Calculator, DollarSign, Percent, Calendar, Home, Briefcase, 
  Landmark, Zap, ArrowRight, ArrowLeft, CheckCircle, HelpCircle,
  TrendingDown
} from 'lucide-react';

interface Props {
  data: SimulationData;
  onChange: (data: SimulationData) => void;
  onSimulate: () => void;
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

const CalculatorForm: React.FC<Props> = ({ data, onChange, onSimulate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus first input of the step
    setTimeout(() => {
       const inputs = document.querySelectorAll('input:not([type="hidden"]):not([disabled])');
       if (inputs.length > 0) {
           (inputs[0] as HTMLElement).focus();
       }
    }, 100);
  }, [currentStep]);

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
    <div className="bg-white md:h-full flex flex-col h-full relative">
      {/* Progress Header */}
      <div className="px-4 py-3 md:px-5 md:py-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex justify-between items-center mb-1.5 md:mb-2">
          <span className="text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-wider">
            Fase {currentStep} de {steps.length}
          </span>
          <span className="text-[10px] md:text-xs text-slate-400 font-medium">
            {steps[currentStep - 1].label}
          </span>
        </div>
        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 custom-scrollbar">
        <div className="max-w-md mx-auto space-y-6 animate-fade-in">
          
          {/* --- PASSO 1: DADOS FINANCEIROS --- */}
          {currentStep === 1 && (
            <>
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                     <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Home className="w-4 h-4"/></div>
                     <label className="text-sm font-bold text-slate-700">Valor do Imóvel</label>
                  </div>
                  <input
                    type="text"
                    value={formatCurrency(data.propertyValue)}
                    onChange={(e) => handleCurrencyChange('propertyValue', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
               </div>

               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><DollarSign className="w-4 h-4"/></div>
                        <label className="text-sm font-bold text-slate-700">Entrada</label>
                     </div>
                     <div className="flex gap-1">
                        <button onClick={() => updateField('downPayment', data.propertyValue * 0.2)} className="text-[10px] bg-white border px-2 py-0.5 rounded font-medium hover:bg-slate-100">20%</button>
                        <button onClick={() => updateField('downPayment', data.propertyValue * 0.5)} className="text-[10px] bg-white border px-2 py-0.5 rounded font-medium hover:bg-slate-100">50%</button>
                     </div>
                  </div>
                  <input
                    type="text"
                    value={formatCurrency(data.downPayment)}
                    onChange={(e) => handleCurrencyChange('downPayment', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
               </div>

               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                     <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg"><Briefcase className="w-4 h-4"/></div>
                     <label className="text-sm font-bold text-slate-700">Renda Familiar</label>
                  </div>
                  <input
                    type="text"
                    value={formatCurrency(data.monthlyIncome)}
                    onChange={(e) => handleCurrencyChange('monthlyIncome', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      Sugerido: {formatCurrency(estimatedMinIncome)}
                  </div>
               </div>
            </>
          )}

          {/* --- PASSO 2: CONDIÇÕES DO CRÉDITO --- */}
          {currentStep === 2 && (
             <>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><Calendar className="w-4 h-4"/></div>
                          <label className="text-sm font-bold text-slate-700">Prazo (Anos)</label>
                      </div>
                      <span className="text-lg font-bold text-indigo-700">{data.termYears} Anos</span>
                   </div>
                   <input 
                      type="range" 
                      min="5" 
                      max="35" 
                      value={data.termYears} 
                      onChange={(e) => updateField('termYears', Number(e.target.value))}
                      className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                   />
                   <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>5 anos</span>
                      <span>35 anos</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <label className="text-xs font-bold text-slate-600 mb-2 block">Taxa Anual (%)</label>
                        <div className="relative">
                            <input
                            type="number"
                            step="0.1"
                            value={data.interestRateAnnual}
                            onChange={(e) => updateField('interestRateAnnual', Number(e.target.value))}
                            className="w-full pl-2 pr-6 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                            />
                            <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <label className="text-xs font-bold text-slate-600 mb-2 block">Sistema</label>
                        <div className="flex bg-slate-200 p-1 rounded-lg">
                           <button 
                             onClick={() => updateField('amortizationSystem', 'SAC')}
                             className={`flex-1 py-1.5 text-[10px] font-bold rounded ${data.amortizationSystem === 'SAC' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                           >
                             SAC
                           </button>
                           <button 
                             onClick={() => updateField('amortizationSystem', 'PRICE')}
                             className={`flex-1 py-1.5 text-[10px] font-bold rounded ${data.amortizationSystem === 'PRICE' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                           >
                             PRICE
                           </button>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-center text-slate-400 bg-slate-50 p-2 rounded-lg border border-dashed border-slate-200">
                    💡 Dica: Clique nos bancos no topo para preencher a taxa.
                </div>
             </>
          )}

          {/* --- PASSO 3: OTIMIZAÇÃO (EXTRA) --- */}
          {currentStep === 3 && (
            <div className="space-y-6">
               <div className="text-center">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                     <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Potencialize sua Economia</h3>
                  <p className="text-sm text-slate-500">Adicionar um valor extra na parcela abate juros brutalmente.</p>
               </div>

               <div className="bg-white p-5 rounded-xl border-2 border-amber-100 shadow-sm">
                   <label className="block text-sm font-bold text-slate-700 mb-2">Amortização Extra Mensal (Opcional)</label>
                   <div className="relative mb-4">
                        <input
                            type="text"
                            value={formatCurrency(data.extraAmortizationMonthly || 0)}
                            onChange={(e) => handleCurrencyChange('extraAmortizationMonthly', e.target.value)}
                            className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-bold text-slate-800 text-xl"
                            placeholder="R$ 0,00"
                        />
                   </div>

                   {data.extraAmortizationMonthly && data.extraAmortizationMonthly > 0 ? (
                        <div className="flex gap-2">
                            <button
                            onClick={() => updateField('extraAmortizationStrategy', 'REDUCE_TERM')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all flex flex-col items-center gap-1 ${
                                (data.extraAmortizationStrategy || 'REDUCE_TERM') === 'REDUCE_TERM' 
                                ? 'bg-amber-500 text-white border-amber-500' 
                                : 'bg-white text-slate-500 border-slate-200'
                            }`}
                            >
                            <span>Reduzir Prazo</span>
                            <span className="text-[9px] font-normal opacity-90">(Mais econômico)</span>
                            </button>
                            <button
                            onClick={() => updateField('extraAmortizationStrategy', 'REDUCE_INSTALLMENT')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all flex flex-col items-center gap-1 ${
                                data.extraAmortizationStrategy === 'REDUCE_INSTALLMENT' 
                                ? 'bg-amber-500 text-white border-amber-500' 
                                : 'bg-white text-slate-500 border-slate-200'
                            }`}
                            >
                            <span>Reduzir Parcela</span>
                            <span className="text-[9px] font-normal opacity-90">(Mais alívio mensal)</span>
                            </button>
                        </div>
                   ) : (
                       <button 
                         onClick={() => updateField('extraAmortizationMonthly', 500)}
                         className="w-full py-2 text-sm text-amber-600 font-bold bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 border-dashed"
                       >
                           Testar com R$ 500,00
                       </button>
                   )}
               </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 md:p-5 border-t border-slate-100 flex justify-between items-center bg-white flex-shrink-0 z-20">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
            currentStep === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <button
          onClick={nextStep}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm md:text-base"
        >
          {currentStep === steps.length ? 'Calcular Resultado' : 'Próximo Passo'}
          <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
};

export default CalculatorForm;
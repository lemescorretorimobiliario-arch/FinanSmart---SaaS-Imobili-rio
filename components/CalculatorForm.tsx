import React, { useState, useEffect, useRef } from 'react';
import { SimulationData } from '../types';
import { formatCurrency, parseCurrency, calculateEstimatedMinimumIncome } from '../utils/finance';
import { 
  Calculator, DollarSign, Percent, Calendar, Home, Briefcase, 
  Landmark, Zap, ArrowRight, ArrowLeft, CheckCircle 
} from 'lucide-react';

interface Props {
  data: SimulationData;
  onChange: (data: SimulationData) => void;
  onSimulate: () => void;
}

const steps = [
  { id: 1, label: 'Imóvel' },
  { id: 2, label: 'Entrada' },
  { id: 3, label: 'Prazo' },
  { id: 4, label: 'Taxas' },
  { id: 5, label: 'Renda' },
  { id: 6, label: 'Extra' },
];

const CalculatorForm: React.FC<Props> = ({ data, onChange, onSimulate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when step changes
  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      nextStep();
    }
  };

  // Helper to get estimated minimum income
  const estimatedMinIncome = calculateEstimatedMinimumIncome(
    data.propertyValue,
    data.downPayment,
    data.termYears,
    data.interestRateAnnual
  );

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="bg-white md:h-full flex flex-col h-full relative">
      {/* Progress Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-wider">
            Passo {currentStep} de {steps.length}
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

      {/* Step Content */}
      <div className="flex-1 flex flex-col justify-center px-5 md:px-10 py-2 overflow-y-auto">
        <div className="max-w-md mx-auto w-full animate-fade-in">
          
          {/* STEP 1: Property Value */}
          {currentStep === 1 && (
            <div className="space-y-4 md:space-y-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-2">
                <Home className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-xl md:text-3xl font-bold text-slate-800 leading-tight">
                Qual o valor do imóvel?
              </h2>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={formatCurrency(data.propertyValue)}
                  onChange={(e) => handleCurrencyChange('propertyValue', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full text-2xl md:text-4xl font-semibold text-slate-800 bg-transparent border-b-2 border-slate-200 focus:border-blue-600 focus:outline-none py-2 md:py-3 placeholder-slate-200 transition-colors"
                />
              </div>
              <p className="text-slate-400 text-xs md:text-sm">Insira o valor total de venda.</p>
            </div>
          )}

          {/* STEP 2: Down Payment */}
          {currentStep === 2 && (
            <div className="space-y-4 md:space-y-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-2">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-xl md:text-3xl font-bold text-slate-800 leading-tight">
                Quanto será a entrada?
              </h2>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={formatCurrency(data.downPayment)}
                  onChange={(e) => handleCurrencyChange('downPayment', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full text-2xl md:text-4xl font-semibold text-slate-800 bg-transparent border-b-2 border-slate-200 focus:border-blue-600 focus:outline-none py-2 md:py-3 placeholder-slate-200 transition-colors"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                   onClick={() => updateField('downPayment', data.propertyValue * 0.2)}
                   className="text-[10px] md:text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-colors"
                >
                  20%
                </button>
                <button 
                   onClick={() => updateField('downPayment', data.propertyValue * 0.5)}
                   className="text-[10px] md:text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-colors"
                >
                  50%
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Term */}
          {currentStep === 3 && (
            <div className="space-y-4 md:space-y-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-2">
                <Calendar className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-xl md:text-3xl font-bold text-slate-800 leading-tight">
                Tempo para quitar?
              </h2>
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="number"
                  value={data.termYears}
                  onChange={(e) => updateField('termYears', Number(e.target.value))}
                  onKeyDown={handleKeyDown}
                  className="w-full text-2xl md:text-4xl font-semibold text-slate-800 bg-transparent border-b-2 border-slate-200 focus:border-blue-600 focus:outline-none py-2 md:py-3 placeholder-slate-200 transition-colors"
                />
                <span className="absolute right-0 text-lg md:text-xl text-slate-400 font-medium pointer-events-none">Anos</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="35" 
                value={data.termYears} 
                onChange={(e) => updateField('termYears', Number(e.target.value))}
                className="w-full h-1.5 md:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-4"
              />
              <div className="flex justify-between text-[10px] md:text-xs text-slate-400 font-medium">
                <span>5 Anos</span>
                <span>35 Anos</span>
              </div>
            </div>
          )}

          {/* STEP 4: Rates & System */}
          {currentStep === 4 && (
            <div className="space-y-6 md:space-y-8">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-2">
                <Landmark className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
                Taxas e Sistema
              </h2>
              
              <div className="space-y-4">
                <div>
                    <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1 md:mb-2">Taxa Anual (%)</label>
                    <div className="relative">
                        <input
                        ref={inputRef}
                        type="number"
                        step="0.1"
                        value={data.interestRateAnnual}
                        onChange={(e) => updateField('interestRateAnnual', Number(e.target.value))}
                        className="w-full pl-3 pr-8 py-2 md:py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800 text-base md:text-lg"
                        />
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1 md:mb-2">Sistema de Amortização</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                        onClick={() => updateField('amortizationSystem', 'SAC')}
                        className={`py-2 md:py-3 px-3 md:px-4 rounded-lg border-2 transition-all text-xs md:text-sm font-bold flex flex-col items-center gap-1 ${
                            data.amortizationSystem === 'SAC' 
                            ? 'border-blue-600 bg-blue-50 text-blue-700' 
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                        >
                        <span>SAC</span>
                        <span className="text-[10px] font-normal opacity-80 text-center">Parcela cai</span>
                        </button>
                        <button
                        onClick={() => updateField('amortizationSystem', 'PRICE')}
                        className={`py-2 md:py-3 px-3 md:px-4 rounded-lg border-2 transition-all text-xs md:text-sm font-bold flex flex-col items-center gap-1 ${
                            data.amortizationSystem === 'PRICE' 
                            ? 'border-blue-600 bg-blue-50 text-blue-700' 
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                        >
                        <span>PRICE</span>
                        <span className="text-[10px] font-normal opacity-80 text-center">Parcela fixa</span>
                        </button>
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Income */}
          {currentStep === 5 && (
            <div className="space-y-4 md:space-y-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-2">
                <Briefcase className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-xl md:text-3xl font-bold text-slate-800 leading-tight">
                Renda mensal familiar?
              </h2>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={formatCurrency(data.monthlyIncome)}
                  onChange={(e) => handleCurrencyChange('monthlyIncome', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full text-2xl md:text-4xl font-semibold text-slate-800 bg-transparent border-b-2 border-slate-200 focus:border-blue-600 focus:outline-none py-2 md:py-3 placeholder-slate-200 transition-colors"
                />
              </div>

              {/* INCOME SUGGESTION FEATURE */}
              <div className="mt-4">
                  <button 
                    onClick={() => updateField('monthlyIncome', estimatedMinIncome)}
                    className="group flex items-center gap-3 bg-emerald-50 border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100 p-2.5 md:p-3 rounded-lg w-full transition-all text-left"
                  >
                      <div className="bg-emerald-200 p-1.5 rounded-full text-emerald-700 group-hover:scale-110 transition-transform flex-shrink-0">
                          <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                      </div>
                      <div>
                          <p className="text-[10px] md:text-xs font-bold text-emerald-800 uppercase tracking-wide">Sugestão Recomendada</p>
                          <p className="text-xs md:text-sm text-emerald-700 leading-tight">
                             Renda min: <span className="font-bold">{formatCurrency(estimatedMinIncome)}</span>
                          </p>
                      </div>
                  </button>
              </div>
            </div>
          )}

          {/* STEP 6: Smart Amortization (Optional) */}
          {currentStep === 6 && (
            <div className="space-y-4 md:space-y-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-2">
                <Zap className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
                Amortização Extra?
              </h2>
              <p className="text-slate-500 text-xs md:text-sm">Opcional. Veja o poder de quitar antes.</p>
              
              <div className="bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200">
                 <label className="block text-xs md:text-sm font-medium text-slate-700 mb-2">Valor Extra Mensal</label>
                 <div className="relative mb-4 md:mb-6">
                    <input
                        ref={inputRef}
                        type="text"
                        value={formatCurrency(data.extraAmortizationMonthly || 0)}
                        onChange={(e) => handleCurrencyChange('extraAmortizationMonthly', e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full pl-3 pr-3 py-2 md:py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800 text-base md:text-lg"
                        placeholder="R$ 0,00"
                    />
                 </div>

                 {data.extraAmortizationMonthly && data.extraAmortizationMonthly > 0 ? (
                    <div className="flex gap-2">
                        <button
                        onClick={() => updateField('extraAmortizationStrategy', 'REDUCE_TERM')}
                        className={`flex-1 py-2 text-[10px] md:text-xs font-bold rounded-lg border transition-all ${
                            (data.extraAmortizationStrategy || 'REDUCE_TERM') === 'REDUCE_TERM' 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-slate-500 border-slate-200'
                        }`}
                        >
                        Reduzir Prazo
                        </button>
                        <button
                        onClick={() => updateField('extraAmortizationStrategy', 'REDUCE_INSTALLMENT')}
                        className={`flex-1 py-2 text-[10px] md:text-xs font-bold rounded-lg border transition-all ${
                            data.extraAmortizationStrategy === 'REDUCE_INSTALLMENT' 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-slate-500 border-slate-200'
                        }`}
                        >
                        Reduzir Parcela
                        </button>
                    </div>
                 ) : (
                     <div className="text-center">
                         <button 
                            onClick={() => updateField('extraAmortizationMonthly', 500)}
                            className="text-xs md:text-sm text-blue-600 font-medium hover:underline"
                         >
                             Testar com R$ 500,00 extra
                         </button>
                     </div>
                 )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-4 md:p-6 border-t border-slate-100 flex justify-between items-center bg-white flex-shrink-0 z-20">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
            currentStep === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <button
          onClick={nextStep}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 md:py-3 rounded-full font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-1 active:scale-95 text-sm md:text-base"
        >
          {currentStep === steps.length ? 'Calcular' : 'Continuar'}
          <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
};

export default CalculatorForm;
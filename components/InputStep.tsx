import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { formatCurrency, parseCurrency } from '../utils/finance';

interface InputStepProps {
  title: string;
  subtitle?: string;
  value: number | null;
  onChange: (val: number) => void;
  onNext: () => void;
  type?: 'currency' | 'number';
  placeholder?: string;
  suffix?: string;
  min?: number;
  max?: number;
}

const InputStep: React.FC<InputStepProps> = ({
  title,
  subtitle,
  value,
  onChange,
  onNext,
  type = 'currency',
  placeholder,
  suffix,
  min,
  max
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value !== null) {
      if (type === 'currency') {
        setDisplayValue(formatCurrency(value));
      } else {
        setDisplayValue(value.toString());
      }
    } else {
        setDisplayValue('');
    }
    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [value, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    
    if (type === 'currency') {
      const num = parseCurrency(raw);
      onChange(num);
    } else {
      const num = parseInt(raw.replace(/\D/g, ''), 10) || 0;
      onChange(num);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid()) {
      onNext();
    }
  };

  const isValid = () => {
    if (value === null) return false;
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return value > 0;
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in-up">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">{title}</h2>
      {subtitle && <p className="text-slate-500 mb-6">{subtitle}</p>}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full text-3xl md:text-4xl font-semibold text-slate-800 bg-transparent border-b-2 border-slate-300 focus:border-blue-600 focus:outline-none py-3 placeholder-slate-200 transition-colors"
        />
        {suffix && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-medium pointer-events-none">
                {suffix}
            </span>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!isValid()}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-full text-lg font-medium transition-all duration-300
            ${isValid() 
              ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transform hover:-translate-y-1' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
          `}
        >
          Próximo
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default InputStep;
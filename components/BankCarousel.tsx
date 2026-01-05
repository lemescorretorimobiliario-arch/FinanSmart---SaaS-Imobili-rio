import React, { useEffect, useState } from 'react';
import { getBankRates } from '../utils/api';
import { BankRate } from '../types';

const BankCarousel: React.FC = () => {
  const [rates, setRates] = useState<BankRate[]>([]);

  useEffect(() => {
    getBankRates().then(setRates);
  }, []);

  if (rates.length === 0) return null;

  return (
    <div className="w-full bg-slate-900 overflow-hidden py-3 border-b border-slate-800">
      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-12 items-center">
          {/* Double the list for infinite loop effect */}
          {[...rates, ...rates, ...rates].map((rate, index) => (
            <div key={`${rate.id}-${index}`} className="flex items-center gap-3 text-slate-300">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${rate.logoColor}`}>
                {rate.bankName[0]}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">{rate.bankName}</span>
                <span className="text-xs">
                  {rate.annualRate}% a.a. <span className="text-slate-500">|</span> {rate.monthlyRate}% a.m.
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default BankCarousel;
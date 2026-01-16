import React, { useEffect, useState } from 'react';
import { getBankRates } from '../utils/api';
import { BankRate } from '../types';

interface BankCarouselProps {
  onSelect?: (rate: number) => void;
}

const BankCarousel: React.FC<BankCarouselProps> = ({ onSelect }) => {
  const [rates, setRates] = useState<BankRate[]>([]);

  useEffect(() => {
    getBankRates().then(setRates);
  }, []);

  if (rates.length === 0) return null;

  return (
    <div className="w-full bg-slate-950 overflow-hidden py-2 border-b border-white/5">
      <div className="relative flex overflow-x-auto md:overflow-x-hidden group/marquee touch-manipulation no-scrollbar">
        <div className="flex md:animate-marquee whitespace-nowrap gap-10 items-center group-hover/marquee:paused px-4 md:px-0">
          {/* List for infinite loop effect (only animated on desktop) */}
          {[...rates, ...rates, ...rates].map((rate, index) => (
            <div
              key={`${rate.id}-${index}`}
              className={`flex items-center gap-3 text-slate-300 transition-all ${onSelect ? 'cursor-pointer hover:scale-110 hover:text-white' : ''}`}
              onClick={() => onSelect && onSelect(rate.annualRate)}
              title={onSelect ? "Clique para aplicar esta taxa" : ""}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[10px] ${rate.logoColor} ring-1 ring-white/10`}>
                {rate.bankName[0]}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white leading-tight">{rate.bankName}</span>
                <span className="text-[9px] text-slate-400 font-medium">
                  {rate.annualRate}% a.a. <span className="text-slate-700 mx-1">/</span> {rate.monthlyRate}% a.m.
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
        .group-hover\\/marquee\\:paused:hover .animate-marquee {
            animation-play-state: paused;
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
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

  const duplicatedRates = [...rates, ...rates, ...rates];

  return (
    <div className="w-full bg-slate-950 overflow-hidden py-2 border-b border-white/5">
      <div
        className="relative flex overflow-x-auto md:overflow-x-hidden group/marquee touch-manipulation no-scrollbar"
        onMouseEnter={(e) => {
          const target = e.currentTarget.querySelector('.animate-marquee') as HTMLElement;
          if (target) target.style.animationPlayState = 'paused';
        }}
        onMouseLeave={(e) => {
          const target = e.currentTarget.querySelector('.animate-marquee') as HTMLElement;
          if (target) target.style.animationPlayState = 'running';
        }}
      >
        <div className="flex md:animate-marquee whitespace-nowrap gap-6 sm:gap-8 md:gap-10 items-center px-4 md:px-0">
          {duplicatedRates.map((rate, index) => (
            <div
              key={rate.id + '-' + index}
              className={'flex items-center gap-2 sm:gap-3 text-slate-300 transition-all ' + (onSelect ? 'cursor-pointer hover:scale-110 hover:text-white' : '')}
              onClick={() => onSelect && onSelect(rate.annualRate)}
              title={onSelect ? "Clique para aplicar esta taxa" : ""}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0">
                {rate.logo && (
                  <img
                    src={rate.logo}
                    alt={rate.bankName}
                    className="w-full h-full object-contain p-0.5"
                    loading="lazy"
                  />
                )}
                {!rate.logo && (
                  <span className="text-xs font-bold text-white">{rate.bankName.substring(0, 2)}</span>
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] sm:text-[11px] font-bold text-white leading-tight">{rate.bankName}</span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                  {rate.annualRate}% a.a. <span className="text-slate-700 mx-1">/</span> {rate.monthlyRate}% a.m.
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
};

export default BankCarousel;
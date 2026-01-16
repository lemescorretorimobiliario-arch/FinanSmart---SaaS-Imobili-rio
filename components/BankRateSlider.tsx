import React, { useEffect, useState } from 'react';
import { getBankRates, BankRate } from '../services/bankRatesService';
import { TrendingDown, Clock } from 'lucide-react';

const BankRateSlider: React.FC = () => {
    const [rates, setRates] = useState<BankRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        loadRates();

        // Auto-refresh every 5 minutes
        const interval = setInterval(loadRates, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const loadRates = async () => {
        try {
            const data = await getBankRates();
            setRates(data);
        } catch (error) {
            console.error('Failed to load bank rates:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatLastUpdate = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Agora mesmo';
        if (diffMins < 60) return `${diffMins} min atrás`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h atrás`;

        return date.toLocaleDateString('pt-BR');
    };

    if (loading) {
        return (
            <div className="w-full overflow-hidden bg-gradient-to-r from-slate-50 via-white to-slate-50 py-8 border-y border-slate-100">
                <div className="flex gap-4 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="min-w-[280px] bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                                    <div className="h-3 bg-slate-100 rounded w-20"></div>
                                </div>
                            </div>
                            <div className="h-8 bg-slate-200 rounded w-24 mb-2"></div>
                            <div className="h-3 bg-slate-100 rounded w-28"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Duplicate rates for infinite scroll effect
    const duplicatedRates = [...rates, ...rates, ...rates];

    return (
        <div className="w-full overflow-hidden bg-gradient-to-r from-slate-50 via-white to-slate-50 py-6 sm:py-8 border-y border-slate-100 relative">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 justify-center">
                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-widest">
                        Taxas de Juros - Crédito Imobiliário
                    </h3>
                </div>
            </div>

            {/* Slider Container */}
            <div
                className="relative"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div
                    className={`flex gap-3 sm:gap-4 ${isPaused ? '' : 'animate-scroll'}`}
                    style={{
                        width: 'fit-content',
                    }}
                >
                    {duplicatedRates.map((rate, index) => (
                        <div
                            key={`${rate.bankId}-${index}`}
                            className="min-w-[240px] sm:min-w-[280px] md:min-w-[300px] bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group"
                        >
                            {/* Bank Logo and Name */}
                            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100 flex-shrink-0">
                                    <img
                                        src={rate.logo}
                                        alt={rate.bankName}
                                        className="w-full h-full object-contain p-1"
                                        loading="lazy"
                                        onError={(e) => {
                                            // Fallback to initials if image fails
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                parent.innerHTML = `<span class="text-xs font-bold text-slate-400">${rate.bankName.substring(0, 2)}</span>`;
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                        {rate.bankName}
                                    </h4>
                                    <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                        Crédito Imobiliário
                                    </p>
                                </div>
                            </div>

                            {/* Interest Rate */}
                            <div className="mb-2 sm:mb-3">
                                <div className="flex items-baseline gap-1 sm:gap-2">
                                    <span className="text-2xl sm:text-3xl font-black text-blue-600 group-hover:text-blue-700 transition-colors">
                                        {rate.rate.toFixed(2)}%
                                    </span>
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-400">a.a.</span>
                                </div>
                                <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">
                                    {rate.rateMonthly.toFixed(2)}% a.m.
                                </div>
                            </div>

                            {/* Last Update */}
                            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400 pt-2 sm:pt-3 border-t border-slate-100">
                                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span className="font-medium">{formatLastUpdate(rate.lastUpdate)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none z-10"></div>

            <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-scroll {
          animation: scroll 40s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
        </div>
    );
};

export default BankRateSlider;

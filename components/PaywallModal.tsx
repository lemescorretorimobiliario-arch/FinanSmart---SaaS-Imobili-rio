import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => Promise<void> | void;
    title?: string;
    description?: string;
}

const PaywallModal: React.FC<PaywallModalProps> = ({
    isOpen,
    onClose,
    onUpgrade,
    title = "Limite Atingido",
    description = "Você atingiu o limite de simulações gratuitas. Assine o plano PRO para acesso ilimitado."
}) => {
    const [isUpgrading, setIsUpgrading] = useState(false);

    if (!isOpen) return null;

    const handleUpgradeWrapper = async () => {
        setIsUpgrading(true);
        try {
            await onUpgrade();
            // Keep modal open while redirecting or processing
        } catch (e) {
            console.error(e);
            setIsUpgrading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-scale-in border-4 border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-7 h-7 text-blue-600" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 mb-6 text-sm text-center">
                    {description}
                </p>

                <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left border border-slate-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Vantagens do Plano PRO</h4>
                    <ul className="space-y-2.5">
                        <li className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            Simulações Ilimitadas
                        </li>
                        <li className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            Histórico Completo
                        </li>
                        <li className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            Personalização com sua Foto/Logo
                        </li>
                        <li className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            Exportação de PDF Ilimitada
                        </li>
                    </ul>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100 flex items-center justify-between">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Acesso Ilimitado</span>
                    <div className="text-lg font-black text-slate-800 tracking-tighter">R$ 19,90<span className="text-[10px] text-slate-400 font-normal">/mês</span></div>
                </div>

                <div className="space-y-2">
                    <button
                        onClick={handleUpgradeWrapper}
                        disabled={isUpgrading}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isUpgrading ? (
                            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                        ) : 'Assinar PRO'}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full text-slate-400 font-medium py-2 text-sm hover:text-slate-600"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaywallModal;

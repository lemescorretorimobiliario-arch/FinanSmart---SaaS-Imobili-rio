import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Briefcase, Smile, ArrowRight, Layout, CheckCircle2 } from 'lucide-react';
import { updateUserProfile } from '../utils/auth';
import { toast } from 'sonner';
import { UserRole } from '../core/system';

interface OnboardingScreenProps {
    user: UserProfile;
    onComplete: (user: UserProfile) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ user, onComplete }) => {
    const [selectedType, setSelectedType] = useState<UserRole | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFinish = async () => {
        if (!selectedType) return;

        setIsSubmitting(true);
        try {
            const updatedUser: UserProfile = {
                ...user,
                type: selectedType,
                setupCompleted: true
            };
            await updateUserProfile(updatedUser);
            onComplete(updatedUser);
            toast.success("Perfil configurado com sucesso!");
        } catch (error: any) {
            console.error("Onboarding Error Details:", error);
            const msg = error.message || "Erro desconhecido";
            toast.error(`Erro ao salvar sua escolha: ${msg}. Verifique o console.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 opacity-10">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-400 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-2xl w-full z-10 space-y-8 animate-fade-in-up">
                <div className="text-center space-y-4">
                    <div className="inline-flex p-3 bg-white rounded-2xl shadow-xl shadow-blue-500/10 mb-2">
                        <Layout className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Quase lá, <span className="text-blue-600">{user.name.split(' ')[0]}!</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium max-w-md mx-auto">
                        Como você pretende usar o <span className="font-bold text-slate-700 tracking-tight">FinanSmart</span>?
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* CLIENTE OPTION */}
                    <button
                        onClick={() => setSelectedType(UserRole.CLIENTE)}
                        className={`group relative p-8 rounded-[2.5rem] bg-white border-2 transition-all duration-500 flex flex-col items-center text-center gap-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 ${selectedType === UserRole.CLIENTE
                            ? 'border-blue-600 ring-4 ring-blue-50'
                            : 'border-slate-100'
                            }`}
                    >
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 ${selectedType === UserRole.CLIENTE ? 'bg-blue-600 text-white rotate-6' : 'bg-slate-50 text-slate-400'
                            }`}>
                            <Smile className="w-10 h-10" />
                        </div>

                        <div className="space-y-2">
                            <h3 className={`text-xl font-black ${selectedType === UserRole.CLIENTE ? 'text-blue-600' : 'text-slate-900'}`}>
                                Sou Cliente
                            </h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
                                Quero simular meu financiamento e otimizar minhas parcelas sozinho.
                            </p>
                        </div>

                        {selectedType === UserRole.CLIENTE && (
                            <div className="absolute top-6 right-6 text-blue-600 animate-scale-in">
                                <CheckCircle2 className="w-8 h-8 fill-blue-50" />
                            </div>
                        )}
                    </button>

                    {/* CORRETOR OPTION */}
                    <button
                        onClick={() => setSelectedType(UserRole.CORRETOR)}
                        className={`group relative p-8 rounded-[2.5rem] bg-white border-2 transition-all duration-500 flex flex-col items-center text-center gap-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 ${selectedType === UserRole.CORRETOR
                            ? 'border-indigo-600 ring-4 ring-indigo-50'
                            : 'border-slate-100'
                            }`}
                    >
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 ${selectedType === UserRole.CORRETOR ? 'bg-indigo-600 text-white -rotate-6' : 'bg-slate-50 text-slate-400'
                            }`}>
                            <Briefcase className="w-10 h-10" />
                        </div>

                        <div className="space-y-2">
                            <h3 className={`text-xl font-black ${selectedType === UserRole.CORRETOR ? 'text-indigo-600' : 'text-slate-900'}`}>
                                Sou Corretor
                            </h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
                                Quero gerenciar meus leads e enviar simulações profissionais em PDF.
                            </p>
                        </div>

                        {selectedType === UserRole.CORRETOR && (
                            <div className="absolute top-6 right-6 text-indigo-600 animate-scale-in">
                                <CheckCircle2 className="w-8 h-8 fill-indigo-50" />
                            </div>
                        )}
                    </button>
                </div>

                <div className="pt-8 flex flex-col items-center gap-4">
                    <button
                        onClick={handleFinish}
                        disabled={!selectedType || isSubmitting}
                        className={`w-full max-w-xs py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 text-xs ${selectedType
                            ? 'bg-slate-900 text-white hover:bg-blue-600 shadow-blue-500/20'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                Confirmar Escolha <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        Isso irá personalizar seu painel de controle
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OnboardingScreen;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, CheckCircle, ArrowRight, Star, Shield, Layout, TrendingUp, Users, Zap, Search, PieChart, FileText } from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
            {/* Header - Fixed Glassmorphism */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 md:h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="premium-gradient p-1 rounded-lg shadow-blue-500/10 group-hover:scale-105 transition-all duration-300">
                            <Layout className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-bold text-sm tracking-tight text-slate-900">Finan<span className="text-blue-600">Smart</span></span>
                    </div>

                    <nav className="hidden md:flex items-center gap-6">
                        <a href="#features" className="text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider">Recursos</a>
                        <a href="#pricing" className="text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider">Planos</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider"
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => navigate('/simulador')}
                            className="btn-primary px-4 py-1.5 text-[10px]"
                        >
                            Ver Simulador
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-24 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-white">
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold text-[9px] uppercase tracking-widest mb-6 animate-fade-in-up">
                        <Star className="w-2.5 h-2.5 fill-blue-600" />
                        O Simulador nº 1 do Mercado Imobiliário
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-slate-950 tracking-tight mb-4 leading-[1.1] max-w-4xl mx-auto animate-fade-in-up">
                        Feche mais vendas com <br />
                        <span className="text-blue-600">Inteligência Financeira.</span>
                    </h1>

                    <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Crie simulações precisas em segundos, compare taxas reais de todos os bancos e gere relatórios profissionais PDF para seus clientes.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <button
                            onClick={() => navigate('/simulador')}
                            className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                        >
                            Começar Simulação
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Área do Corretor
                        </button>
                    </div>
                </div>
            </section>

            {/* Logical Flow: Features */}
            <section id="features" className="py-16 md:py-24 bg-slate-50 border-t border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 mb-2 inline-block">Funcionalidades</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">Tudo que você precisa para vender mais.</h2>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Economize horas de cálculos manuais e erros de estimativa.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        {[
                            { icon: Search, title: 'Comparação Real', desc: 'Acesse taxas atualizadas de Bradesco, Itaú, Santander e Caixa Econômica.' },
                            { icon: PieChart, title: 'Visualização Clara', desc: 'Gráficos interativos que mostram a evolução da dívida e economia real.' },
                            { icon: FileText, title: 'PDF Profissional', desc: 'Gere propostas personalizadas com sua logo e contatos em um clique.' },
                            { icon: Zap, title: 'Cálculo de Amortização', desc: 'Mostre ao seu cliente como economizar milhares de reais pagando extras.' },
                            { icon: Shield, title: 'Dados Seguros', desc: 'Simulações salvas na nuvem para acesso rápido em qualquer dispositivo.' },
                            { icon: Users, title: 'Gestão de Leads', desc: 'Organize suas simulações por cliente e nunca perca um acompanhamento.' },
                        ].map((f, i) => (
                            <div key={i} className="finan-card p-6 group hover:border-blue-200">
                                <div className="w-8 h-8 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <f.icon className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1.5">{f.title}</h3>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-16 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Transparência Total.</h2>
                        <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">Use grátis ou acelere com o plano PRO.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
                        {/* Free */}
                        <div className="finan-card p-6 flex flex-col">
                            <h3 className="text-base font-bold text-slate-900">Plano Grátis</h3>
                            <div className="mt-3 mb-4">
                                <span className="text-3xl font-bold text-slate-900">R$ 0</span>
                                <span className="text-slate-400 text-xs ml-2">/sempre</span>
                            </div>
                            <ul className="space-y-2 flex-1 mb-6">
                                <ListItem>Até 5 simulações/mês</ListItem>
                                <ListItem>Principais bancos brasileiros</ListItem>
                                <ListItem muted>Exportação PDF</ListItem>
                                <ListItem muted>Gestão de Leads</ListItem>
                            </ul>
                            <button onClick={() => navigate('/simulador')} className="btn-secondary w-full py-2 text-xs font-bold">Começar Agora</button>
                        </div>

                        {/* PRO */}
                        <div className="finan-card-premium p-6 flex flex-col border-blue-200 bg-blue-50/10 ring-2 ring-blue-600/5">
                            <div className="flex justify-between items-start">
                                <h3 className="text-base font-bold text-slate-900">Plano PRO</h3>
                                <span className="text-[8px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">Melhor Valor</span>
                            </div>
                            <div className="mt-3 mb-4">
                                <span className="text-3xl font-bold text-slate-900">R$ 49</span>
                                <span className="text-slate-400 text-xs ml-2">/mês</span>
                            </div>
                            <ul className="space-y-2 flex-1 mb-6">
                                <ListItem>Simulações ilimitadas</ListItem>
                                <ListItem>PDF Profissional Ilimitado</ListItem>
                                <ListItem>Cálculo de Amortização Extra</ListItem>
                                <ListItem>Gestão de Leads Integrada</ListItem>
                            </ul>
                            <button onClick={() => navigate('/login')} className="btn-primary w-full py-2 text-xs font-bold">Seja PRO Agora</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="premium-gradient p-1 rounded-lg">
                            <Layout className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-base tracking-tight">FinanSmart</span>
                    </div>
                    <p className="text-slate-500 text-[10px] mb-2 uppercase tracking-widest font-bold">© 2024 FinanSmart. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

const ListItem = ({ children, muted = false }: { children: React.ReactNode, muted?: boolean }) => (
    <li className={`flex items-center gap-2 text-[11px] ${muted ? 'text-slate-300 line-through' : 'text-slate-600'} font-medium`}>
        <CheckCircle className={`w-3.5 h-3.5 ${muted ? 'text-slate-200' : 'text-emerald-500'}`} />
        <span>{children}</span>
    </li>
);

export default LandingPage;

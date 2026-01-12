import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, CheckCircle, ArrowRight, Star, Shield, Layout, TrendingUp, Users } from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <Layout className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Finan<span className="text-blue-600">Smart</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-slate-600 font-medium hover:text-blue-600 transition-colors"
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => navigate('/simulador')}
                            className="hidden sm:flex bg-blue-600 text-white px-5 py-2 rounded-full font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                        >
                            Começar Agora
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-bold text-sm mb-8 animate-fade-in shadow-sm border border-blue-100">
                        <Star className="w-4 h-4 fill-blue-700" />
                        <span>A ferramenta nº 1 para Corretores e Compradores</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight max-w-5xl mx-auto">
                        Financiamento Imobiliário <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Simplificado e Inteligente</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Simule cenários reais, compare taxas de todos os bancos e tome a melhor decisão para o seu futuro.
                        Perfeito para quem compra e essencial para quem vende.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/simulador')}
                            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                        >
                            Fazer Simulação Grátis
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all"
                        >
                            Já tenho conta
                        </button>
                    </div>

                    {/* Social Proof */}
                    <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 grayscale opacity-70">
                        {/* Placeholders for Bank Logos or generic trust indicators */}
                        <div className="font-bold text-xl">TRUSTED BY 1000+ AGENTS</div>
                    </div>
                </div>

                {/* Background Decorative Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-100/50 rounded-full blur-3xl -z-10 opacity-60 mix-blend-multiply"></div>
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-100/50 rounded-full blur-3xl -z-10 opacity-60 mix-blend-multiply"></div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Por que escolher o FinanSmart?</h2>
                        <p className="text-slate-500 text-lg">
                            Uma plataforma completa que une precisão matemática com uma experiência de uso incrível.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Calculator className="w-8 h-8 text-blue-600" />}
                            title="Cálculos Precisos"
                            description="Simulação exata considerando taxas atuais, sistemas de amortização (SAC/Price) e todos os custos envolvidos."
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-8 h-8 text-indigo-600" />}
                            title="Comparativo Inteligente"
                            description="Visualize quanto você economiza antecipando parcelas ou mudando de banco. Dados claros para decisões difíceis."
                        />
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-emerald-600" />}
                            title="Para Corretores"
                            description="Gere leads qualificados, envie PDFs profissionais com sua marca e feche mais vendas com a confiança dos números."
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Planos que cabem no seu bolso</h2>
                        <p className="text-slate-500 text-lg">Comece grátis e faça o upgrade quando precisar de mais poder.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Plan */}
                        <div className="border border-slate-200 rounded-2xl p-8 relative hover:shadow-lg transition-shadow">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Plano Gratuito</h3>
                            <div className="text-4xl font-bold text-slate-900 mb-6">R$ 0 <span className="text-lg text-slate-400 font-normal">/mês</span></div>
                            <ul className="space-y-4 mb-8">
                                <ListItem>Até 5 simulações mensais</ListItem>
                                <ListItem>Cálculos básicos SAC e Price</ListItem>
                                <ListItem>Visualização de resultados na tela</ListItem>
                                <ListItem muted>Sem exportação de PDF</ListItem>
                                <ListItem muted>Sem área do corretor</ListItem>
                            </ul>
                            <button
                                onClick={() => navigate('/simulador')}
                                className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Começar Grátis
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div className="border-2 border-blue-600 rounded-2xl p-8 relative shadow-xl bg-white scale-105 z-10">
                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                                MAIS POPULAR
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Plano PRO</h3>
                            <div className="text-4xl font-bold text-slate-900 mb-6">R$ 29,90 <span className="text-lg text-slate-400 font-normal">/mês</span></div>
                            <ul className="space-y-4 mb-8">
                                <ListItem check><strong>Simulações Ilimitadas</strong></ListItem>
                                <ListItem check>Geração de PDF Profissional</ListItem>
                                <ListItem check>Gestão de Leads (CRM Básico)</ListItem>
                                <ListItem check>Personalização com sua Marca</ListItem>
                                <ListItem check>Comparativo de Amortização</ListItem>
                            </ul>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
                            >
                                Assinar Agora
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1 rounded-lg">
                            <Layout className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg text-white tracking-tight">Finan<span className="text-blue-500">Smart</span></span>
                    </div>
                    <div className="text-sm">
                        © 2024 FinanSmart. Todos os direitos reservados.
                    </div>
                    <div className="flex gap-6 text-sm">
                        <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
                        <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-white transition-colors">Contato</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Sub-components
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="mb-4 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed">
            {description}
        </p>
    </div>
);

const ListItem = ({ children, muted = false, check = true }: { children: React.ReactNode, muted?: boolean, check?: boolean }) => (
    <li className={`flex items-center gap-3 ${muted ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-600'}`}>
        {check ? (
            <CheckCircle className={`w-5 h-5 ${muted ? 'text-slate-300' : 'text-emerald-500'}`} />
        ) : (
            <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            </div>
        )}
        <span className="text-sm md:text-base">{children}</span>
    </li>
);

export default LandingPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, CheckCircle, ArrowRight, Star, Shield, Layout, TrendingUp, Users, Zap } from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
            {/* Header - Fixed Glassmorphism */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="premium-gradient p-2 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all duration-300">
                            <Layout className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-xl md:text-2xl tracking-tighter text-slate-900">Finan<span className="text-blue-600">Smart</span></span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Funcionalidades</a>
                        <a href="#pricing" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Preços</a>
                        <a href="#testimonials" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Depoimentos</a>
                    </nav>

                    <div className="flex items-center gap-3 md:gap-5">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-slate-600 font-bold hover:text-blue-600 transition-colors text-sm md:text-base px-4 py-2 rounded-xl hover:bg-slate-100/50"
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => navigate('/simulador')}
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-500/20 active:scale-95"
                        >
                            Começar Agora
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 md:pt-48 md:pb-56 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/50 text-blue-700 font-black text-[10px] md:text-xs uppercase tracking-widest mb-10 animate-fade-in-up shadow-sm">
                        <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
                        A ferramenta definitiva para o mercado imobiliário
                    </div>

                    <h1 className="text-4xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.9] max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Financiamento Imobiliário <br />
                        <span className="text-gradient">Inteligente.</span>
                    </h1>

                    <p className="text-base md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Simulações ultra-precisas com as taxas reais de todos os bancos brasileiros.
                        Transforme conversas em contratos fechados.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <button
                            onClick={() => navigate('/simulador')}
                            className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-base hover:bg-blue-600 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3 group"
                        >
                            <Calculator className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            Simulação Gratuita
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-base hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
                        >
                            Sou Corretor <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Dashboard Preview - Premium Style */}
                    <div className="mt-24 md:mt-32 relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full"></div>
                        <div className="relative glass-card rounded-[2.5rem] p-2 md:p-3 border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
                            <div className="bg-slate-900 rounded-[2rem] overflow-hidden aspect-[16/9] relative border border-slate-800">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-transparent to-indigo-900/20"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center group cursor-pointer" onClick={() => navigate('/simulador')}>
                                        <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mb-4 mx-auto border border-white/20 group-hover:scale-110 transition-transform">
                                            <Calculator className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <p className="text-white font-black text-sm uppercase tracking-widest opacity-40">Clique para Abrir o Simulador</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 md:py-48 bg-slate-900 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-slate-50 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto mb-24">
                        <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter">O poder dos dados na palma da sua mão.</h2>
                        <p className="text-slate-400 text-lg md:text-2xl font-medium">
                            Tecnologia proprietária para quem não aceita estimativas vagas.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Calculator className="w-10 h-10 text-blue-400" />}
                            title="Precisão Bancária"
                            description="SAC, Price, taxas fixas e variáveis. O FinanSmart replica a matemática exata dos sistemas bancários."
                            delay="0s"
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-10 h-10 text-emerald-400" />}
                            title="Multi-Comparativo"
                            description="Visualização lado a lado de todos os grandes bancos (Caixa, Itaú, Santander, etc) em segundos."
                            delay="0.1s"
                        />
                        <FeatureCard
                            icon={<Shield className="w-10 h-10 text-indigo-400" />}
                            title="Autoridade no Fechamento"
                            description="Gere propostas em PDF personalizadas com sua marca. Transforme-se em um consultor financeiro de elite."
                            delay="0.2s"
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-32 md:py-48 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter">Escolha seu próximo passo.</h2>
                        <p className="text-slate-500 text-lg md:text-2xl font-medium">Simplicidade no preço, profundidade nos resultados.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-slate-50 rounded-[3rem] p-12 border border-slate-100 hover:border-blue-200 transition-all flex flex-col items-center text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 bg-slate-200/50 px-4 py-1.5 rounded-full italic">Iniciante</span>
                            <h3 className="text-3xl font-black text-slate-900 mb-2">Simulador</h3>
                            <div className="flex items-baseline gap-1 mt-6 mb-12">
                                <span className="text-6xl font-black text-slate-900 tracking-tighter">R$ 0</span>
                                <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">/mês</span>
                            </div>
                            <ul className="space-y-6 mb-12 text-left w-full">
                                <ListItem>Simulações Essenciais</ListItem>
                                <ListItem>Cálculos SAC/Price</ListItem>
                                <ListItem muted>PDFs Profissionais</ListItem>
                                <ListItem muted>Marca Personalizada</ListItem>
                            </ul>
                            <button
                                onClick={() => navigate('/simulador')}
                                className="w-full py-5 bg-white border-2 border-slate-200 text-slate-900 font-black rounded-[1.5rem] hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95"
                            >
                                Começar Grátis
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-slate-900 rounded-[3rem] p-12 relative shadow-2xl shadow-blue-500/20 flex flex-col items-center text-center text-white overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <span className="relative z-10 text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">Profissional</span>
                            <h3 className="relative z-10 text-3xl font-black mb-2">Plano PRO</h3>
                            <div className="relative z-10 flex items-baseline gap-1 mt-6 mb-12">
                                <span className="text-6xl font-black tracking-tighter">R$ 19,90</span>
                                <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">/mês</span>
                            </div>
                            <ul className="relative z-10 space-y-6 mb-12 text-left w-full">
                                <ListItem check white><strong>Simulações Ilimitadas</strong></ListItem>
                                <ListItem check white>Exportação de PDF Premium</ListItem>
                                <ListItem check white>Sua Marca nas Propostas</ListItem>
                                <ListItem check white>Suporte VIP 24h</ListItem>
                            </ul>
                            <button
                                onClick={() => navigate('/login')}
                                className="relative z-10 w-full py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:bg-blue-500 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                            >
                                Adquirir Agora <Zap className="w-5 h-5 fill-current" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-32 md:py-48 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter">Quem usa, aprova.</h2>
                        <p className="text-slate-500 text-lg md:text-2xl font-medium">A escolha das imobiliárias que buscam alta performance.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <TestimonialCard
                            name="Ricardo Silva"
                            role="Top Producer Ipanema"
                            content="A ferramenta é um fechador de negócios. O PDF gera uma autoridade instantânea com o cliente."
                            avatar="https://i.pravatar.cc/150?u=ricardo"
                        />
                        <TestimonialCard
                            name="Mariana Costa"
                            role="Investidora Imobiliária"
                            content="Simplesmente não tem erro. Os cálculos batem com a planilha da Caixa na vírgula. Essencial."
                            avatar="https://i.pravatar.cc/150?u=mariana"
                        />
                        <TestimonialCard
                            name="Bruno Mendes"
                            role="Diretor Comercial"
                            content="A economia de tempo para minha equipe foi absurda. Focamos no cliente, não nos cálculos."
                            avatar="https://i.pravatar.cc/150?u=bruno"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-32 md:py-48 bg-white">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="premium-gradient rounded-[4rem] p-16 md:p-32 text-white relative overflow-hidden shadow-3xl">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-5xl md:text-8xl font-black mb-10 leading-[0.9] tracking-tighter">Domine cada centavo do seu negócio.</h2>
                            <p className="text-blue-100/70 text-lg md:text-2xl mb-16 font-medium">Junte-se à revolução financeira imobiliária.</p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                                <button
                                    onClick={() => navigate('/simulador')}
                                    className="w-full sm:w-auto bg-white text-blue-900 px-12 py-6 rounded-3xl font-black text-xl hover:shadow-2xl hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Começar Grátis
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full sm:w-auto bg-blue-900/30 backdrop-blur-md text-white border-2 border-white/20 px-12 py-6 rounded-3xl font-black text-xl hover:bg-blue-900/50 transition-all"
                                >
                                    Seja PRO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 py-24 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-20">
                        <div className="max-w-xs">
                            <div className="flex items-center gap-2.5 mb-8">
                                <div className="bg-blue-600 p-2 rounded-xl">
                                    <Layout className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-black text-2xl tracking-tighter text-white">Finan<span className="text-blue-600">Smart</span></span>
                            </div>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                Transformando a clareza financeira em oportunidade de negócio para o corretor moderno.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm">
                            <div className="space-y-4">
                                <h4 className="text-white font-black uppercase tracking-widest text-[10px]">Produto</h4>
                                <ul className="space-y-2 text-slate-500 font-bold">
                                    <li><a href="#" className="hover:text-blue-600">Simulador</a></li>
                                    <li><a href="#" className="hover:text-blue-600">Comparativo</a></li>
                                    <li><a href="#" className="hover:text-blue-600">Planos</a></li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-white font-black uppercase tracking-widest text-[10px]">Legal</h4>
                                <ul className="space-y-2 text-slate-500 font-bold">
                                    <li><a href="#" className="hover:text-blue-600">Privacidade</a></li>
                                    <li><a href="#" className="hover:text-blue-600">Termos</a></li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-white font-black uppercase tracking-widest text-[10px]">Suporte</h4>
                                <ul className="space-y-2 text-slate-500 font-bold">
                                    <li><a href="#" className="hover:text-blue-600 transition-colors">WhatsApp</a></li>
                                    <li><a href="#" className="hover:text-blue-600 transition-colors">Email</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">© 2024 FinanSmart System. Todos os direitos reservados.</p>
                        <div className="flex gap-6">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10"></div>
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10"></div>
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10"></div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Sub-components
const TestimonialCard = ({ name, role, content, avatar }: { name: string, role: string, content: string, avatar: string }) => (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all">
        <div className="flex items-center gap-4 mb-6">
            <img src={avatar} alt={name} className="w-14 h-14 rounded-full border-2 border-blue-50" />
            <div>
                <h4 className="font-black text-slate-800 text-sm tracking-tight">{name}</h4>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{role}</p>
            </div>
        </div>
        <div className="relative">
            <span className="absolute -top-4 -left-2 text-6xl text-blue-100 font-serif leading-none italic select-none">“</span>
            <p className="text-slate-500 font-medium italic relative z-10 text-sm leading-relaxed">{content}</p>
        </div>
    </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <div className={`border rounded-[1.5rem] transition-all duration-300 ${isOpen ? 'bg-slate-50 border-blue-200' : 'bg-white border-slate-100'}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
            >
                <span className="font-bold text-slate-900">{question}</span>
                <div className={`p-2 rounded-xl bg-slate-100 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-blue-600 text-white' : ''}`}>
                    <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-40' : 'max-h-0'}`}>
                <div className="px-6 pb-6 text-slate-500 text-sm font-medium leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: string }) => (
    <div className="bg-white/5 border border-white/10 p-10 rounded-[2rem] hover:bg-white/10 transition-all hover:-translate-y-2 group animate-fade-in-up" style={{ animationDelay: delay }}>
        <div className="mb-6 bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-lg">
            {description}
        </p>
    </div>
);

const ListItem = ({ children, muted = false, check = true, white = false }: { children: React.ReactNode, muted?: boolean, check?: boolean, white?: boolean }) => (
    <li className={`flex items-center gap-4 ${muted ? 'opacity-30 line-through' : white ? 'text-white' : 'text-slate-600'} font-medium`}>
        {check ? (
            <CheckCircle className={`w-5 h-5 ${muted ? 'text-slate-300' : white ? 'text-white' : 'text-blue-600'}`} />
        ) : (
            <div className="w-5 h-5 flex items-center justify-center">
                <div className={`w-1.5 h-1.5 rounded-full ${white ? 'bg-white/30' : 'bg-slate-300'}`}></div>
            </div>
        )}
        <span className="text-base md:text-lg">{children}</span>
    </li>
);

export default LandingPage;

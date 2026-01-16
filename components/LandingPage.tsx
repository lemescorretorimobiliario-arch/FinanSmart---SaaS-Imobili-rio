import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, CheckCircle, ArrowRight, Star, Shield, Layout, TrendingUp, Users } from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                            <Layout className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-base md:text-xl tracking-tight">Finan<span className="text-blue-600">Smart</span></span>
                    </div>
                    <div className="flex items-center gap-3 md:gap-6">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-slate-600 font-bold hover:text-blue-600 transition-colors text-sm md:text-base px-2 py-1"
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => navigate('/simulador')}
                            className="hidden sm:flex bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-200 active:scale-95"
                        >
                            Começar Agora
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-16 pb-24 md:pt-28 md:pb-40 overflow-hidden">
                {/* Abstract Background blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-blue-700 font-bold text-xs md:text-sm mb-8 animate-fade-in-up shadow-sm">
                        <Star className="w-4 h-4 fill-blue-600 animate-pulse" />
                        <span>A ferramenta nº 1 para Corretores e Compradores</span>
                    </div>

                    <h1 className="text-2xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1] max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Financiamento Imobiliário <br className="hidden md:block" />
                        <span className="text-gradient">Simplificado e Inteligente</span>
                    </h1>

                    <p className="text-sm md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Simule cenários reais, compare taxas de todos os bancos e tome a melhor decisão para o seu futuro.
                        Dados precisos que geram confiança e fecham negócios.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <button
                            onClick={() => navigate('/simulador')}
                            className="w-full sm:w-auto px-8 py-4 premium-gradient text-white rounded-xl font-bold text-base hover:shadow-xl hover:shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Calculator className="w-5 h-5" />
                            Fazer Simulação Grátis
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-base hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                            Já tenho conta <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Mockup Preview Container - Scaled Down */}
                    <div className="mt-16 md:mt-20 glass-card rounded-2xl p-1.5 md:p-2 animate-fade-in-up max-w-4xl mx-auto" style={{ animationDelay: '0.4s' }}>
                        <div className="bg-slate-900 rounded-[0.9rem] overflow-hidden shadow-2xl aspect-video relative flex items-center justify-center border border-slate-800">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-transparent"></div>
                            <div className="text-white text-center p-6">
                                <Calculator className="w-12 h-12 mx-auto mb-3 text-blue-400 opacity-50" />
                                <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">[ Interface do Simulador ]</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 md:py-32 bg-slate-900 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-50 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Por que escolher o FinanSmart?</h2>
                        <p className="text-slate-400 text-lg md:text-xl">
                            Tecnologia de ponta para quem busca clareza financeira no mercado imobiliário.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
                        <FeatureCard
                            icon={<Calculator className="w-8 h-8 text-blue-400" />}
                            title="Cálculos Precisos"
                            description="Simulação exata considerando taxas reais do mercado, sistemas SAC/Price e todos os custos cartorários inclusos."
                            delay="0s"
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-8 h-8 text-emerald-400" />}
                            title="Comparativo de Bancos"
                            description="Compare simultaneamente as condições dos principais bancos do Brasil e descubra onde você economiza mais."
                            delay="0.1s"
                        />
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-indigo-400" />}
                            title="Gerador de PDFs"
                            description="Transforme suas simulações em propostas profissionais em PDF para seus clientes ou para seu próprio planejamento."
                            delay="0.2s"
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 md:py-40 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Planos Simples e Transparentes</h2>
                        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">Explore gratuitamente ou leve sua consultoria para o próximo nível com o Plano PRO.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-slate-50 rounded-[2rem] p-10 md:p-12 border border-slate-200 relative group hover:border-blue-200 transition-all">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Plano Gratuito</h3>
                            <p className="text-slate-500 mb-8 border-b border-slate-200 pb-6">Para quem está começando a planejar.</p>
                            <div className="text-5xl font-bold text-slate-900 mb-10">R$ 0 <span className="text-xl text-slate-400 font-normal">/mês</span></div>
                            <ul className="space-y-5 mb-12">
                                <ListItem>Até 5 simulações/mês</ListItem>
                                <ListItem>Cálculos SAC e Price</ListItem>
                                <ListItem>Histórico Salvo</ListItem>
                                <ListItem muted>Sem exportação de PDF</ListItem>
                                <ListItem muted>Sem marca personalizada</ListItem>
                            </ul>
                            <button
                                onClick={() => navigate('/simulador')}
                                className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
                            >
                                Começar Grátis
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div className="premium-gradient rounded-[2rem] p-10 md:p-12 relative shadow-2xl shadow-blue-900/20 scale-100 md:scale-105 z-10 text-white group">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 text-sm font-black px-6 py-1.5 rounded-full shadow-lg">
                                MAIS RECOMENDADO
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Plano PRO</h3>
                            <p className="text-blue-100/70 mb-8 border-b border-white/10 pb-6">Para o corretor de alto impacto.</p>
                            <div className="text-5xl font-bold mb-10">R$ 19,90 <span className="text-xl text-blue-200/60 font-normal">/mês</span></div>
                            <ul className="space-y-5 mb-12 text-blue-50">
                                <ListItem check white><strong>Simulações Ilimitadas</strong></ListItem>
                                <ListItem check white>Geração de PDFs Profissionais</ListItem>
                                <ListItem check white>Comparativo Multibancos</ListItem>
                                <ListItem check white>Personalização de Proposta</ListItem>
                                <ListItem check white>Suporte Prioritário</ListItem>
                            </ul>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-xl active:scale-95"
                            >
                                Assinar Agora
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 md:py-32 bg-slate-50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">O que dizem nossos usuários</h2>
                        <p className="text-slate-500 text-lg">Milhares de corretores e clientes já transformaram sua forma de calcular financiamentos.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <TestimonialCard
                            name="Ricardo Silva"
                            role="Corretor de Imóveis"
                            content="O FinanSmart mudou meu jogo. Envio o PDF da simulação na hora para o cliente pelo WhatsApp e isso gera uma autoridade incrível."
                            avatar="https://i.pravatar.cc/150?u=ricardo"
                        />
                        <TestimonialCard
                            name="Mariana Costa"
                            role="Compradora"
                            content="Consegui comparar as taxas da Caixa, Itaú e Santander em segundos. Descobri que economizaria 40 mil reais no longo prazo."
                            avatar="https://i.pravatar.cc/150?u=mariana"
                        />
                        <TestimonialCard
                            name="Bruno Mendes"
                            role="Gestor Imobiliário"
                            content="A ferramenta é intuitiva e os cálculos SAC/Price batem exatamente com o que os bancos apresentam. Essencial para o dia a dia."
                            avatar="https://i.pravatar.cc/150?u=bruno"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 md:py-32 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Dúvidas Frequentes</h2>
                        <p className="text-slate-500">Tudo o que você precisa saber sobre o FinanSmart.</p>
                    </div>

                    <div className="space-y-4">
                        <FAQItem
                            question="As taxas de juros são atualizadas?"
                            answer="Sim! Nossa equipe monitora as taxas dos principais bancos semanalmente para garantir que suas simulações sejam o mais fiéis possível à realidade do mercado."
                        />
                        <FAQItem
                            question="Posso cancelar minha assinatura PRO a qualquer momento?"
                            answer="Com certeza. Não há fidelidade. Você pode cancelar sua assinatura diretamente pelo painel de controle com apenas um clique."
                        />
                        <FAQItem
                            question="Os PDFs são personalizáveis?"
                            answer="Sim, no plano PRO você pode incluir seu nome, foto, CRECI e contatos, tornando a proposta uma ferramenta poderosa de marketing pessoal."
                        />
                        <FAQItem
                            question="Quais bancos estão disponíveis para comparação?"
                            answer="Atualmente oferecemos comparativos para Caixa Econômica, Itaú, Santander, Bradesco e Banco do Brasil."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 md:py-32 bg-slate-50">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <div className="bg-slate-900 rounded-[3rem] p-12 md:p-24 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]"></div>

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter">Pronto para dominar o mercado?</h2>
                            <p className="text-slate-400 text-lg md:text-xl mb-12 font-medium">Junte-se a centenas de profissionais que já usam a inteligência financeira a favor de seus negócios.</p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={() => navigate('/simulador')}
                                    className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-[1.5rem] font-bold text-lg hover:shadow-2xl hover:bg-blue-500 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Calculator className="w-6 h-6" /> Começar Agora
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-[1.5rem] font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                                >
                                    Ver Preços <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-xl">
                                <Layout className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-2xl tracking-tight">Finan<span className="text-blue-600">Smart</span></span>
                        </div>
                        <div className="flex gap-10 text-slate-500 font-medium">
                            <a href="#" className="hover:text-blue-600">Privacidade</a>
                            <a href="#" className="hover:text-blue-600">Termos</a>
                            <a href="#" className="hover:text-blue-600 transition-colors">Suporte</a>
                        </div>
                        <div className="text-slate-400 text-sm">
                            © 2024 FinanSmart - Todos os direitos reservados.
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

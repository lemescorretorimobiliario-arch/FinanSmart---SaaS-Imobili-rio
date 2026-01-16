import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import {
    LayoutDashboard, Users, UserCheck, Shield, TrendingUp,
    Search, Filter, MoreVertical, X, Check, Loader2, AlertTriangle,
    CreditCard, Calendar, BarChart3, CheckCircle2, Lock, ArrowRight,
    RefreshCw, Trash2, Zap, Star, Clock, TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminStats {
    totalUsers: number;
    activeSubs: number;
    totalSimulations: number;
    conversionRate: number;
}

const AdminPanel: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'USERS' | 'SIMULATIONS'>('DASHBOARD');
    const [users, setUsers] = useState<any[]>([]);
    const [simulations, setSimulations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        activeSubs: 0,
        totalSimulations: 0,
        conversionRate: 0
    });

    // Handle Admin Login
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginForm.username === 'admin' && loginForm.password === '123456') {
            setIsAuthenticated(true);
            toast.success("Acesso Admin concedido!");
        } else {
            toast.error("Credenciais inválidas.");
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchStats();
            if (activeTab === 'USERS') fetchUsers();
            if (activeTab === 'SIMULATIONS') fetchSimulations();
        }
    }, [isAuthenticated, activeTab]);

    const fetchStats = async () => {
        try {
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: proCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('plan', 'PRO');
            const { count: simCount } = await supabase.from('saved_simulations').select('*', { count: 'exact', head: true });

            const totalUsers = userCount || 0;
            const activeSubs = proCount || 0;
            const totalSimulations = simCount || 0;
            const conversionRate = totalUsers > 0 ? (activeSubs / totalUsers) * 100 : 0;

            setStats({
                totalUsers,
                activeSubs,
                totalSimulations,
                conversionRate: parseFloat(conversionRate.toFixed(1))
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            toast.error("Erro ao listar usuários.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSimulations = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('saved_simulations')
                .select('*, profiles(full_name, email)')
                .order('created_at', { ascending: false })
                .limit(50);
            if (error) throw error;
            setSimulations(data || []);
        } catch (error) {
            toast.error("Erro ao listar simulações.");
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserPlan = async (userId: string, newPlan: 'FREE' | 'PRO') => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    plan: newPlan,
                    subscription_status: newPlan === 'PRO' ? 'manual_override' : null
                })
                .eq('id', userId);

            if (error) throw error;
            toast.success(`Usuário atualizado para ${newPlan}`);
            fetchUsers();
            fetchStats();
        } catch (err) {
            toast.error("Erro ao atualizar plano.");
        }
    };

    const resetSimulations = async (userId: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ simulations_count: 0 })
                .eq('id', userId);

            if (error) throw error;
            toast.success("Contagem de simulações zerada.");
            fetchUsers();
        } catch (err) {
            toast.error("Erro ao resetar simulações.");
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[dashed-grid]">
                <div className="w-full max-w-md bg-white rounded-[2rem] p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative text-center mb-8">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Acesso de Administrador</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">Insira as credenciais para continuar.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4 relative">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Usuário</label>
                            <input
                                type="text"
                                value={loginForm.username}
                                onChange={e => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all"
                                placeholder="Admin"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Senha</label>
                            <input
                                type="password"
                                value={loginForm.password}
                                onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all"
                                placeholder="******"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 group"
                        >
                            Entrar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                        <p className="text-xs text-slate-400 font-bold">FinanSmart System Admin v1.2</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Admin Header - Compact */}
            <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1 rounded-lg">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="font-black text-base tracking-tight">FinanSmart <span className="text-blue-400 text-xs uppercase tracking-widest ml-1">Admin</span></h1>
                    </div>
                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                        <button
                            onClick={() => setActiveTab('DASHBOARD')}
                            className={`flex items-center gap-1.5 transition-colors ${activeTab === 'DASHBOARD' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" /> Dash
                        </button>
                        <button
                            onClick={() => setActiveTab('USERS')}
                            className={`flex items-center gap-1.5 transition-colors ${activeTab === 'USERS' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Users className="w-3.5 h-3.5" /> Usuários
                        </button>
                        <button
                            onClick={() => setActiveTab('SIMULATIONS')}
                            className={`flex items-center gap-1.5 transition-colors ${activeTab === 'SIMULATIONS' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            <BarChart3 className="w-3.5 h-3.5" /> Logs
                        </button>
                        <button
                            onClick={() => setIsAuthenticated(false)}
                            className="ml-4 text-red-400 hover:text-red-300 transition-colors"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-3 md:p-6 space-y-4">

                {/* DASHBOARD VIEW */}
                {activeTab === 'DASHBOARD' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-black text-slate-800">Visão Geral do Sistema</h2>
                            <button onClick={fetchStats} className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
                                <RefreshCw className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                icon={<Users className="w-5 h-5 text-blue-600" />}
                                label="Total Usuários"
                                value={stats.totalUsers}
                                trend="Base total"
                            />
                            <StatCard
                                icon={<Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
                                label="Membros PRO"
                                value={stats.activeSubs}
                                trend={`${stats.conversionRate}% Conv.`}
                            />
                            <StatCard
                                icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
                                label="Simulações"
                                value={stats.totalSimulations}
                                trend="Vida toda"
                            />
                            <StatCard
                                icon={<Zap className="w-5 h-5 text-emerald-600" />}
                                label="Taxa Conversão"
                                value={`${stats.conversionRate}%`}
                                trend="Meta: 10%"
                            />
                        </div>

                        {/* Recent Activity Card */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                    <Clock className="w-3" /> Novos Usuários
                                </h3>
                                <div className="space-y-4">
                                    {users.slice(0, 5).map(u => (
                                        <div key={u.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px] uppercase">
                                                    {u.full_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900">{u.full_name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold">{u.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                    {users.length === 0 && <p className="text-xs text-slate-400 italic">Nenhuma atividade recente.</p>}
                                </div>
                            </div>

                            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                    <TrendingUp className="w-3" /> Últimas Simulações
                                </h3>
                                <div className="space-y-4">
                                    {simulations.slice(0, 5).map(s => (
                                        <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                    <CreditCard className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900">R$ {s.property_value.toLocaleString()}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold">Por: {s.profiles?.full_name || 'Desconhecido'}</p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black tracking-widest text-slate-400">
                                                {new Date(s.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                    {simulations.length === 0 && <p className="text-xs text-slate-400 italic">Carregando logs...</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* USERS VIEW */}
                {activeTab === 'USERS' && (
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                            <h2 className="text-lg font-black text-slate-800">Base de Usuários</h2>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2.5 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-xs"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-bold">
                                    <thead className="bg-slate-50 text-slate-400 uppercase tracking-[0.2em] text-[9px] border-b border-slate-100">
                                        <tr>
                                            <th className="p-4">Usuário / Cadastro</th>
                                            <th className="p-4">Tipo</th>
                                            <th className="p-4">Plano Atual</th>
                                            <th className="p-4">Uso Free</th>
                                            <th className="p-4 text-right">Ações Rápidas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {isLoading ? (
                                            <tr><td colSpan={5} className="p-10 text-center text-slate-400">Processando...</td></tr>
                                        ) : filteredUsers.length === 0 ? (
                                            <tr><td colSpan={5} className="p-10 text-center text-slate-400">Nenhum registro encontrado.</td></tr>
                                        ) : (
                                            filteredUsers.map((u) => (
                                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${u.plan === 'PRO' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-100 text-slate-400'}`}>
                                                                {u.full_name?.[0] || 'U'}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-slate-900">{u.full_name}</div>
                                                                <div className="text-slate-400 text-[10px] font-bold">{u.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${u.user_type === 'CORRETOR' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                                            {u.user_type}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${u.plan === 'PRO' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                {u.plan}
                                                            </span>
                                                            {u.plan === 'PRO' && <Lock className="w-3 h-3 text-emerald-400" />}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full ${u.simulations_count >= 5 ? 'bg-red-500' : 'bg-blue-500'}`}
                                                                    style={{ width: `${Math.min((u.simulations_count / 5) * 100, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-500">{u.simulations_count}/5</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {u.plan === 'FREE' ? (
                                                                <button
                                                                    onClick={() => updateUserPlan(u.id, 'PRO')}
                                                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                                                                    title="Upgrade para PRO"
                                                                >
                                                                    <Zap className="w-4 h-4 fill-current" />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => updateUserPlan(u.id, 'FREE')}
                                                                    className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all"
                                                                    title="Rebaixar para FREE"
                                                                >
                                                                    <TrendingDown className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => resetSimulations(u.id)}
                                                                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                                                title="Resetar Limite"
                                                            >
                                                                <RefreshCw className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* SIMULATIONS VIEW (Logs) */}
                {activeTab === 'SIMULATIONS' && (
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-black text-slate-800">Logs de Simulações</h2>
                            <p className="text-xs text-slate-400 font-bold">Últimas 50 operações</p>
                        </div>

                        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left text-xs font-bold">
                                <thead className="bg-slate-50 text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100">
                                    <tr>
                                        <th className="p-4">Data/Hora</th>
                                        <th className="p-4">Usuário</th>
                                        <th className="p-4">Valor Imóvel</th>
                                        <th className="p-4">Entrada</th>
                                        <th className="p-4">Sistema</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {simulations.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 text-slate-500">
                                                {new Date(s.created_at).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-black">{s.profiles?.full_name || 'Visitante'}</div>
                                                <div className="text-[10px] font-bold text-slate-400">{s.profiles?.email || 'N/A'}</div>
                                            </td>
                                            <td className="p-4 text-blue-600">
                                                R$ {s.property_value.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-emerald-600">
                                                R$ {s.down_payment.toLocaleString()}
                                            </td>
                                            <td className="p-4 font-black">
                                                <span className="bg-slate-100 px-2 py-1 rounded text-[9px]">{s.amortization_system}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {simulations.length === 0 && (
                                        <tr><td colSpan={5} className="p-10 text-center text-slate-400">Nenhum log disponível.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const StatCard = ({ icon, label, value, trend }: any) => (
    <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        </div>
        <div className="flex items-end justify-between">
            <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{value}</p>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>
        </div>
    </div>
);

export default AdminPanel;

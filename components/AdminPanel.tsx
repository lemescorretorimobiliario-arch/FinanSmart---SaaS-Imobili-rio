import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import {
    LayoutDashboard, Users, Shield, TrendingUp,
    Search, RefreshCw, BarChart3, Clock, TrendingDown, Star, Zap, CreditCard, Lock, ArrowRight, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { UserRole, UserPlan, SYSTEM_LIMITS } from '../core/system';

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

            setStats({
                totalUsers: userCount || 0,
                activeSubs: proCount || 0,
                totalSimulations: simCount || 0,
                conversionRate: userCount ? parseFloat(((proCount || 0) / userCount * 100).toFixed(1)) : 0
            });
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setUsers(data || []);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSimulations = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from('saved_simulations').select('*, profiles(full_name, email)').order('created_at', { ascending: false }).limit(50);
            if (error) throw error;
            setSimulations(data || []);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserPlan = async (userId: string, newPlan: UserPlan) => {
        try {
            const { error } = await supabase.from('profiles').update({
                plan: newPlan,
                subscription_status: newPlan === 'PRO' ? 'active' : 'canceled'
            }).eq('id', userId);
            if (error) throw error;
            toast.success(`Plano alterado para ${newPlan}`);
            fetchUsers();
        } catch (err) {
            toast.error("Erro ao atualizar.");
        }
    };

    const resetCount = async (userId: string) => {
        try {
            const { error } = await supabase.from('profiles').update({ simulations_count: 0 }).eq('id', userId);
            if (error) throw error;
            toast.success("Contagem resetada.");
            fetchUsers();
        } catch (err) {
            toast.error("Erro ao resetar.");
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl space-y-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/20">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">FinanSmart Admin</h1>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Usuário"
                            className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                            onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Senha"
                            className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                            onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                        />
                        <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl">
                            Entrar no Sistema
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            <header className="bg-slate-950 text-white h-16 sticky top-0 z-40 px-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <span className="font-black tracking-tighter text-lg">ADMIN <span className="text-blue-500">CONTROL</span></span>
                </div>
                <nav className="flex gap-6">
                    <button onClick={() => setActiveTab('DASHBOARD')} className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'DASHBOARD' ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}>Dashboard</button>
                    <button onClick={() => setActiveTab('USERS')} className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'USERS' ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}>Usuários</button>
                    <button onClick={() => setActiveTab('SIMULATIONS')} className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SIMULATIONS' ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}>Logs</button>
                    <button onClick={() => setIsAuthenticated(false)} className="text-[10px] font-black uppercase tracking-widest text-red-500 ml-4">Sair</button>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto p-6 space-y-8">
                {activeTab === 'DASHBOARD' && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard label="Total de Contas" value={stats.totalUsers} icon={<Users className="w-5 h-5" />} color="blue" />
                            <StatCard label="Assinantes PRO" value={stats.activeSubs} icon={<Star className="w-5 h-5 fill-current" />} color="amber" />
                            <StatCard label="Simulações" value={stats.totalSimulations} icon={<BarChart3 className="w-5 h-5" />} color="indigo" />
                            <StatCard label="Conversão" value={`${stats.conversionRate}%`} icon={<TrendingUp className="w-5 h-5" />} color="emerald" />
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2 font-mono">
                                    <Clock className="w-3" /> Recent Users
                                </h3>
                                <div className="space-y-4">
                                    {users.slice(0, 5).map(u => (
                                        <div key={u.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-all rounded-xl px-2">
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">{u.full_name?.[0]}</div>
                                                <div>
                                                    <p className="font-black text-slate-900">{u.full_name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold">{u.email}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${u.plan === 'PRO' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{u.plan}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2 font-mono">
                                    <TrendingUp className="w-3" /> Recent Pulse
                                </h3>
                                <div className="space-y-4">
                                    {simulations.slice(0, 5).map(s => (
                                        <div key={s.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 px-2">
                                            <div>
                                                <p className="text-sm font-black text-slate-900">R$ {s.property_value.toLocaleString()}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{s.profiles?.full_name || 'User'}</p>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-300 uppercase">{new Date(s.created_at).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'USERS' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="flex bg-white p-2 rounded-2xl border shadow-sm">
                            <Search className="w-5 h-5 text-slate-300 ml-3" />
                            <input
                                placeholder="Cpf, Nome ou Email..."
                                className="w-full px-4 outline-none font-bold text-sm"
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="bg-white rounded-3xl border shadow-xl overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-900 text-white/50 text-[9px] font-black uppercase tracking-widest border-b border-white/10">
                                    <tr>
                                        <th className="p-5">Identificação</th>
                                        <th className="p-5">Função</th>
                                        <th className="p-5">Assinatura</th>
                                        <th className="p-5">Uso (Free)</th>
                                        <th className="p-5 text-right">Controles</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-bold">
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="p-5">
                                                <p className="font-black text-slate-900 text-sm">{u.full_name}</p>
                                                <p className="text-slate-400 text-[10px]">{u.email}</p>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-2 py-1 rounded text-[9px] uppercase tracking-tighter ${u.user_type === 'CORRETOR' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100'}`}>{u.user_type}</span>
                                            </td>
                                            <td className="p-5">
                                                <select
                                                    value={u.plan}
                                                    onChange={e => updateUserPlan(u.id, e.target.value as UserPlan)}
                                                    className="bg-transparent border-none font-black text-xs text-blue-600 focus:ring-0 cursor-pointer"
                                                >
                                                    <option value="FREE">FREE</option>
                                                    <option value="PRO">PRO (Manual)</option>
                                                </select>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full ${u.simulations_count >= SYSTEM_LIMITS.FREE_SIMULATIONS ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${(u.simulations_count / SYSTEM_LIMITS.FREE_SIMULATIONS) * 100}%` }}></div>
                                                    </div>
                                                    <span className="text-[10px]">{u.simulations_count}/{SYSTEM_LIMITS.FREE_SIMULATIONS}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-right space-x-2">
                                                <button onClick={() => resetCount(u.id)} className="p-2 bg-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Reset Sim Count"><RefreshCw className="w-4 h-4" /></button>
                                                <button className="p-2 bg-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const StatCard = ({ label, value, icon, color }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full ${color === 'blue' ? 'bg-blue-600' : color === 'amber' ? 'bg-amber-500' : color === 'indigo' ? 'bg-indigo-600' : 'bg-emerald-500'}`}></div>
        <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-xl ${color === 'blue' ? 'bg-blue-50 text-blue-600' : color === 'amber' ? 'bg-amber-50 text-amber-600' : color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : ''}`}>
                {icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        </div>
        <p className="text-2xl font-black text-slate-900 tracking-tighter">{value}</p>
    </div>
);

export default AdminPanel;

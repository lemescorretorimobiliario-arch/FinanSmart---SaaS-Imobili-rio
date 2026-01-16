import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { UserProfile } from '../types';
import {
    LayoutDashboard, Users, UserCheck, Shield, TrendingUp,
    Search, Filter, MoreVertical, X, Check, Loader2, AlertTriangle,
    CreditCard, Calendar, BarChart3, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data if DB is empty or RLS blocks
const MOCK_STATS = {
    totalUsers: 142,
    activeSubs: 38,
    conversionRate: 26.7,
    totalSimulations: 1205
};

const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'USERS' | 'SUBSCRIPTIONS'>('DASHBOARD');
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState(MOCK_STATS);

    useEffect(() => {
        if (activeTab === 'USERS') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            // Note: This requires RLS policy: "allow select for admins"
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            if (data) setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Erro ao carregar usuários. Verifique as permissões (RLS).");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        // Implement logic to ban/unban or simple status toggle
        toast.info("Funcionalidade de banimento em desenvolvimento.");
    };

    const grantPro = async (userId: string) => {
        if (!confirm("Confirmar upgrade manual para PRO?")) return;
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ plan: 'PRO', subscription_status: 'manual_override' })
                .eq('id', userId);

            if (error) throw error;
            toast.success("Plano PRO concedido manualmente.");
            fetchUsers();
        } catch (err) {
            toast.error("Erro ao atualizar plano.");
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Admin Header */}
            <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="font-black text-lg tracking-tight">FinanSmart <span className="text-blue-400">ADMIN</span></h1>
                    </div>
                    <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
                        <button
                            onClick={() => setActiveTab('DASHBOARD')}
                            className={`hover:text-blue-400 transition-colors ${activeTab === 'DASHBOARD' ? 'text-blue-400' : 'text-slate-400'}`}
                        >
                            Dash
                        </button>
                        <button
                            onClick={() => setActiveTab('USERS')}
                            className={`hover:text-blue-400 transition-colors ${activeTab === 'USERS' ? 'text-blue-400' : 'text-slate-400'}`}
                        >
                            Usuários
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

                {/* DASHBOARD VIEW */}
                {activeTab === 'DASHBOARD' && (
                    <div className="space-y-8 animate-fade-in-up">
                        <h2 className="text-2xl font-black">Visão Geral</h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            <StatCard
                                icon={<Users className="w-6 h-6 text-blue-600" />}
                                label="Total Usuários"
                                value={stats.totalUsers.toString()}
                                trend="+12% esse mês"
                            />
                            <StatCard
                                icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                                label="Assinantes ativos"
                                value={stats.activeSubs.toString()}
                                trend="Alta conversão"
                            />
                            <StatCard
                                icon={<TrendingUp className="w-6 h-6 text-amber-500" />}
                                label="Conversão PRO"
                                value={`${stats.conversionRate}%`}
                                trend="Meta: 30%"
                            />
                            <StatCard
                                icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
                                label="Simulações"
                                value={stats.totalSimulations.toString()}
                                trend="Uso recorde"
                            />
                        </div>

                        {/* Recent Activity Mockup */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Atividade Recente do Sistema</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-4 text-sm pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                        <span className="font-bold text-slate-700">Novo assinante PRO</span>
                                        <span className="text-slate-400 text-xs">há {i * 15} minutos</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* USERS VIEW */}
                {activeTab === 'USERS' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="text-2xl font-black">Gerenciar Usuários</h2>
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white border border-slate-200 pl-10 pr-4 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                                        <tr>
                                            <th className="p-6">Usuário</th>
                                            <th className="p-6">Tipo</th>
                                            <th className="p-6">Plano</th>
                                            <th className="p-6">Simulações</th>
                                            <th className="p-6 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {isLoading ? (
                                            <tr><td colSpan={5} className="p-10 text-center text-slate-400">Carregando...</td></tr>
                                        ) : filteredUsers.length === 0 ? (
                                            <tr><td colSpan={5} className="p-10 text-center text-slate-400">Nenhum usuário encontrado.</td></tr>
                                        ) : (
                                            filteredUsers.map((u) => (
                                                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                                                                {u.full_name?.[0] || 'U'}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-900">{u.full_name}</div>
                                                                <div className="text-slate-400 text-xs">{u.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${u.user_type === 'CORRETOR' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                                            {u.user_type}
                                                        </span>
                                                    </td>
                                                    <td className="p-6">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${u.plan === 'PRO' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                            {u.plan}
                                                        </span>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-500" style={{ width: `${Math.min((u.simulations_count / 5) * 100, 100)}%` }}></div>
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-600">{u.simulations_count}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {u.plan !== 'PRO' && (
                                                                <button
                                                                    onClick={() => grantPro(u.id)}
                                                                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                                                                    title="Dar Plano PRO"
                                                                >
                                                                    <Shield className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                                                                title="Bloquear"
                                                            >
                                                                <AlertTriangle className="w-4 h-4" />
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
            </main>
        </div>
    );
};

const StatCard = ({ icon, label, value, trend }: any) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform">
        <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{trend}</span>
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl md:text-3xl font-black text-slate-900">{value}</p>
    </div>
);

export default AdminPanel;

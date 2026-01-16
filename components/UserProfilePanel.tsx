import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import {
  Camera, Save, LogOut, Shield, Mail, User, Phone,
  Image as ImageIcon, Star, ArrowRight, LayoutDashboard,
  Settings, Calculator, Clock, CheckCircle2, Zap, Home, ChevronRight
} from 'lucide-react';
import { updateUserProfile } from '../utils/auth';
import { uploadImage } from '../utils/storage';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { formatCurrency } from '../utils/finance';
import { UserRole, UserPlan } from '../core/system';

interface Props {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
  onLogout: () => void;
  onUpgrade?: () => Promise<void> | void;
}

const UserProfilePanel: React.FC<Props> = ({ user, onUpdate, onLogout, onUpgrade }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ ...user });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SETTINGS'>('OVERVIEW');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'OVERVIEW') {
      fetchRecentHistory();
    }
  }, [activeTab, user.id]);

  const fetchRecentHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('saved_simulations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      setRecentHistory(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSimClick = (sim: any) => {
    const mapped = {
      id: sim.id,
      date: sim.created_at,
      propertyValue: sim.property_value,
      downPayment: sim.down_payment,
      termYears: sim.term_years,
      monthlyPayment: sim.monthly_payment,
      interestRate: sim.interest_rate_annual,
      amortizationSystem: sim.amortization_system,
      monthlyIncome: sim.monthly_income
    };
    navigate('/simulador', { state: { loadSim: mapped } });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateUserProfile(formData);
      onUpdate(updated);
      toast.success("Configurações salvas!");
    } catch (error) {
      toast.error("Erro ao salvar perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgradeClick = async () => {
    if (onUpgrade) {
      setIsUpgrading(true);
      try {
        await onUpgrade();
      } catch (error) {
        console.error(error);
      } finally {
        setIsUpgrading(false);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Limite de 2MB por imagem.");
      return;
    }

    try {
      if (type === 'avatar') setIsUploadingAvatar(true);
      else setIsUploadingCover(true);

      const publicUrl = await uploadImage(user.id, file, 'avatars');

      const updatedData = {
        ...formData,
        [type === 'avatar' ? 'avatarUrl' : 'coverUrl']: publicUrl
      };

      setFormData(updatedData);
      const updatedUser = await updateUserProfile(updatedData);
      onUpdate(updatedUser);

      toast.success("Imagem atualizada!");
    } catch (error: any) {
      toast.error("Erro no upload.");
    } finally {
      if (type === 'avatar') setIsUploadingAvatar(false);
      else setIsUploadingCover(false);
    }
  };

  const usagePercent = Math.min((user.simulationsCount / 5) * 100, 100);
  const remainingCount = Math.max(5 - user.simulationsCount, 0);

  return (
    <div className="max-w-4xl mx-auto p-3 md:p-4 space-y-4 animate-fade-in pb-20 md:pb-8 font-sans">

      {/* Header Section - Compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight text-center md:text-left">Minha Conta</h1>
          <p className="text-slate-500 font-medium text-[10px] text-center md:text-left uppercase tracking-wider">Gestão de perfil e assinatura.</p>
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-lg w-full md:w-fit mx-auto md:mx-0">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'OVERVIEW' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'SETTINGS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Preferências
          </button>
        </div>
      </div>

      {activeTab === 'OVERVIEW' ? (
        <div className="space-y-6 animate-fade-in-up">

          {/* USER CARD PANORAMIC */}
          <div className="finan-card rounded-2xl">
            <div className="h-28 md:h-32 bg-slate-900 relative">
              {formData.coverUrl && <img src={formData.coverUrl} className="w-full h-full object-cover opacity-60" alt="" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            <div className="px-6 pb-6 flex flex-col items-center md:items-start text-center md:text-left relative">
              <div className="absolute -top-10 md:-top-12 left-1/2 md:left-8 -translate-x-1/2 md:translate-x-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-white shadow-2xl bg-white overflow-hidden relative">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-black">
                      {user.name[0]}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-14 md:pt-3 md:pl-36 flex flex-col md:flex-row md:items-end justify-between w-full gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{user.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5 justify-center md:justify-start">
                    <span className="bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border border-blue-100">
                      {user.type === UserRole.CORRETOR ? 'Corretor' : 'Comprador'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    title="Ver Painel"
                  >
                    <LayoutDashboard className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setActiveTab('SETTINGS')}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    title="Editar Perfil"
                  >
                    <Settings className="w-6 h-6" />
                  </button>
                  {/* ADMIN LINK */}
                  {(user.email?.includes('admin') || user.email === 'lemes_333@hotmail.com') && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-sm shadow-slate-900/20"
                      title="Painel Admin"
                    >
                      <Shield className="w-6 h-6" />
                    </button>
                  )}
                  <button
                    onClick={onLogout}
                    className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    title="Sair"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* PLAN CARD */}
            <div className="md:col-span-2 space-y-6">
              <div className="finan-card p-6 relative group border-blue-100">
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status do Plano</h3>
                    <p className={`text-2xl font-black tracking-tighter ${user.plan === UserPlan.PRO ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {user.plan}
                    </p>
                  </div>
                  <div className={`p-3 rounded-2xl ${user.plan === UserPlan.PRO ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'} shadow-inner`}>
                    {user.plan === UserPlan.PRO ? <Shield className="w-6 h-6" /> : <Calculator className="w-6 h-6" />}
                  </div>
                </div>

                {user.plan === 'FREE' ? (
                  <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-slate-500">Uso de Simulações</span>
                        <span className="text-xs font-black text-blue-600">{user.simulationsCount} de 5 realizadas</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full transition-all duration-1000 ${usagePercent > 80 ? 'bg-amber-500' : 'bg-blue-600'}`}
                          style={{ width: `${usagePercent}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">
                      Simulações restantes: <span className="font-black text-slate-900">{remainingCount}</span>
                    </p>
                    <button
                      onClick={handleUpgradeClick}
                      disabled={isUpgrading}
                      className="w-full premium-gradient text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-2xl hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                      {isUpgrading ? "Redirecionando..." : "Assinar PRO Agora"} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-bold">Acesso ilimitado ativo.</span>
                    </div>
                    <button
                      onClick={() => {
                        toast.info("Para gerenciar sua assinatura, acesse o email enviado pela Stripe ou contate o suporte.");
                      }}
                      className="w-full bg-white text-slate-500 py-3 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
                    >
                      Gerenciar Assinatura
                    </button>
                  </div>
                )}

                {/* Decorative background element */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors"></div>
              </div>

              {/* RECENT HISTORY LIST */}
              <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Atividade Recente</h3>
                  <button onClick={() => navigate('/dashboard')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Ver tudo</button>
                </div>

                <div className="space-y-4">
                  {isLoadingHistory ? (
                    <div className="py-4 animate-pulse space-y-3">
                      <div className="h-12 bg-slate-50 rounded-xl"></div>
                      <div className="h-12 bg-slate-50 rounded-xl"></div>
                    </div>
                  ) : recentHistory.length > 0 ? (
                    recentHistory.map((sim, i) => (
                      <button
                        key={i}
                        onClick={() => handleSimClick(sim)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-blue-50 rounded-[1.5rem] transition-all group border border-transparent hover:border-blue-100"
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Home className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800">{formatCurrency(sim.property_value)}</p>
                            <p className="text-[10px] font-medium text-slate-400">{new Date(sim.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-all" />
                      </button>
                    ))
                  ) : (
                    <div className="py-8 text-center bg-slate-50/30 rounded-3xl border border-dashed border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nenhuma simulação recente</p>
                    </div>
                  )}
                </div>
              </div>

              {/* QUICK NAV */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center gap-3 hover:-translate-y-1 transition-all group"
                >
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-600">Histórico</span>
                </button>
                <button
                  onClick={() => navigate('/simulador')}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center gap-3 hover:-translate-y-1 transition-all group"
                >
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Simular</span>
                </button>
              </div>
            </div>

            {/* INFO SIDEBAR */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden">
                <Zap className="absolute top-4 right-4 text-yellow-400 w-8 h-8 opacity-20" />
                <h3 className="text-base font-black tracking-tight mb-4">Vantagens PRO</h3>
                <ul className="space-y-3">
                  {[
                    "Simulações Ilimitadas",
                    "PDFs com seu nome e foto",
                    "Gestão completa de Leads",
                    "Suporte prioritário",
                    "Sem anúncios"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-medium text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Informações de Contato</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-3.5 h-3.5 text-blue-600 mt-0.5" />
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-3.5 h-3.5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</p>
                      <p className="text-xs font-bold text-slate-700">{user.phone || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in-up space-y-8">
          <form onSubmit={handleSave} className="space-y-8">
            {/* IMAGE UPLOADS */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Avatar Section */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center gap-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto de Perfil</h3>
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative w-28 h-28 rounded-full cursor-pointer group hover:scale-105 transition-transform"
                >
                  <div className="w-full h-full rounded-full border-4 border-white shadow-xl bg-slate-50 overflow-hidden relative">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 text-2xl font-black">
                        {user.name[0]}
                      </div>
                    )}

                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isUploadingAvatar ? 'opacity-100' : ''}`}>
                      {isUploadingAvatar ? (
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Camera className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-2 bg-blue-600 rounded-full text-white shadow-lg shadow-blue-600/30">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-widest">Clique para alterar (Máx 2MB)</p>
                <input ref={avatarInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
              </div>

              {/* Cover Section */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center gap-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capa do Perfil</h3>
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="relative w-full h-32 rounded-[1.5rem] cursor-pointer group hover:brightness-95 transition-all overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center"
                >
                  {formData.coverUrl ? (
                    <img src={formData.coverUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-300">
                      <ImageIcon className="w-10 h-10 mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Enviar Capa</span>
                    </div>
                  )}

                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isUploadingCover ? 'opacity-100' : ''}`}>
                    {isUploadingCover ? (
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <ImageIcon className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-widest">Ideal para corretores (1200x400)</p>
                <input ref={coverInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
              </div>
            </div>

            {/* FORM FIELDS */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl pl-10 pr-4 py-3 font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm"
                      placeholder="Seu Nome"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp / Telefone</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl pl-10 pr-4 py-3 font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-sm"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail (Inalterável)</label>
                  <div className="relative group opacity-60">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full bg-slate-100 border-2 border-slate-100 rounded-xl pl-10 pr-4 py-3 font-bold text-slate-400 cursor-not-allowed outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          <div className="bg-red-50 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border border-red-100">
            <div className="text-center md:text-left">
              <h3 className="text-red-600 font-black text-base uppercase tracking-widest">Zona de Perigo</h3>
              <p className="text-red-400 text-xs font-medium">Ao sair da conta, você precisará fazer login novamente.</p>
            </div>
            <button
              onClick={onLogout}
              className="w-full md:w-auto bg-white text-red-600 px-8 py-4 rounded-xl font-bold border-2 border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-95"
            >
              Encerrar Sessão
            </button>
          </div>
        </div>
      )
      }
    </div >
  );
};

export default UserProfilePanel;
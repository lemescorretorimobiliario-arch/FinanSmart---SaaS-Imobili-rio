import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import {
  Camera, Save, LogOut, Shield, Mail, User, Phone,
  Image as ImageIcon, Star, ArrowRight, LayoutDashboard,
  Settings, Calculator, Clock, CheckCircle2, Zap
} from 'lucide-react';
import { updateUserProfile } from '../utils/auth';
import { uploadImage } from '../utils/storage';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
    <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8 animate-fade-in pb-24 font-sans">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Portal do Usuário</h1>
          <p className="text-slate-500 font-medium">Gerencie sua conta, plano e preferências.</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl md:w-fit">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex-1 md:w-32 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'OVERVIEW' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex-1 md:w-32 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'SETTINGS' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Configurações
          </button>
        </div>
      </div>

      {activeTab === 'OVERVIEW' ? (
        <div className="space-y-8 animate-fade-in-up">

          {/* USER CARD PANORAMIC */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden relative">
            <div className="h-44 bg-gradient-to-r from-slate-900 to-blue-900 relative">
              {formData.coverUrl && <img src={formData.coverUrl} className="w-full h-full object-cover opacity-60" alt="" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            <div className="px-8 pb-8 flex flex-col items-center md:items-start text-center md:text-left relative">
              <div className="absolute -top-14 md:-top-16 left-1/2 md:left-10 -translate-x-1/2 md:translate-x-0">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] border-[6px] border-white shadow-2xl bg-white overflow-hidden relative">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-black">
                      {user.name[0]}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-20 md:pt-4 md:pl-44 flex flex-col md:flex-row md:items-end justify-between w-full gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{user.name}</h2>
                  <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100 italic">
                      {user.type === 'CORRETOR' ? 'Corretor de Imóveis' : 'Cliente Particular'}
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

          <div className="grid md:grid-cols-3 gap-8">
            {/* PLAN CARD */}
            <div className="md:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status do Plano</h3>
                    <p className={`text-3xl font-black tracking-tighter ${user.plan === 'PRO' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      Plano {user.plan}
                    </p>
                  </div>
                  <div className={`p-4 rounded-3xl ${user.plan === 'PRO' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'} shadow-inner`}>
                    {user.plan === 'PRO' ? <Shield className="w-8 h-8" /> : <Calculator className="w-8 h-8" />}
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
                      Você ainda possui <span className="font-black text-slate-900">{remainingCount} simulações</span> gratuitas.
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
                      <span className="font-bold">Acesso ilimitado ativo. Aproveite todos os recursos!</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Salvo</p>
                        <p className="text-xl font-black text-slate-800">{user.simulationsCount}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vencimento</p>
                        <p className="text-xl font-black text-slate-800">Mensal</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Decorative background element */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors"></div>
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
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center gap-3 hover:-translate-y-1 transition-all group"
                >
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-600">Simular</span>
                </button>
              </div>
            </div>

            {/* INFO SIDEBAR */}
            <div className="space-y-8">
              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <Zap className="absolute top-4 right-4 text-yellow-400 w-10 h-10 opacity-20" />
                <h3 className="text-lg font-black tracking-tight mb-4">Vantagens PRO</h3>
                <ul className="space-y-4">
                  {[
                    "Simulações Ilimitadas",
                    "PDFs com seu nome e foto",
                    "Gestão completa de Leads",
                    "Suporte prioritário",
                    "Sem anúncios"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-medium text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Informações de Contato</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</p>
                      <p className="text-sm font-bold text-slate-700">{user.phone || 'Não informado'}</p>
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
            <div className="grid md:grid-cols-2 gap-8">
              {/* Avatar Section */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center gap-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Foto de Perfil</h3>
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative w-32 h-32 rounded-full cursor-pointer group hover:scale-105 transition-transform"
                >
                  <div className="w-full h-full rounded-full border-4 border-white shadow-xl bg-slate-50 overflow-hidden relative">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 text-3xl font-black">
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
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center gap-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Capa do Perfil</h3>
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
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nome Completo</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                      placeholder="Seu Nome"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">WhatsApp / Telefone</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">E-mail (Inalterável)</label>
                  <div className="relative group opacity-60">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full bg-slate-100 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-400 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full md:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                  <Save className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>

          <div className="bg-red-50 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 border border-red-100">
            <div className="text-center md:text-left">
              <h3 className="text-red-600 font-black text-lg">Zona de Perigo</h3>
              <p className="text-red-400 text-sm font-medium">Ao sair da conta, você precisará fazer login novamente para acessar seus dados.</p>
            </div>
            <button
              onClick={onLogout}
              className="w-full md:w-auto bg-white text-red-600 px-8 py-4 rounded-xl font-bold border-2 border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-95"
            >
              Encerrar Sessão
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePanel;
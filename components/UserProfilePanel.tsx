import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { Camera, Save, LogOut, Shield, Mail, User, Phone, Image as ImageIcon } from 'lucide-react';
import { updateUserProfile } from '../utils/auth';
import { uploadImage } from '../utils/storage';

interface Props {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
  onLogout: () => void;
  onUpgrade?: () => Promise<void> | void;
}

const UserProfilePanel: React.FC<Props> = ({ user, onUpdate, onLogout, onUpgrade }) => {
  const [formData, setFormData] = useState({ ...user });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateUserProfile(formData);
      onUpdate(updated);
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      setIsSaving(false);
      alert("Erro ao salvar perfil. Tente novamente.");
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

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
       alert("O arquivo é muito grande. Máximo 2MB.");
       return;
    }

    try {
      if (type === 'avatar') setIsUploadingAvatar(true);
      else setIsUploadingCover(true);

      // Usamos o bucket 'avatars' para ambos para simplificar a configuração do Storage no SQL
      const publicUrl = await uploadImage(user.id, file, 'avatars'); 

      setFormData(prev => ({
        ...prev,
        [type === 'avatar' ? 'avatarUrl' : 'coverUrl']: publicUrl
      }));

    } catch (error: any) {
      console.error(error);
      alert("Erro no upload: " + error.message);
    } finally {
      if (type === 'avatar') setIsUploadingAvatar(false);
      else setIsUploadingCover(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-fade-in pb-24 md:pb-8">
      <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">Minha Conta</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 relative group">
        
        {/* Cover Photo Area */}
        <div className="h-32 md:h-40 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden group/cover">
           {formData.coverUrl ? (
             <img src={formData.coverUrl} className="w-full h-full object-cover" alt="Capa" />
           ) : (
             <div className="w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           )}
           
           {/* Cover Upload Overlay/Button */}
           <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none md:pointer-events-auto">
              <button 
                onClick={() => coverInputRef.current?.click()}
                disabled={isUploadingCover}
                className="bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm transition-all pointer-events-auto flex items-center gap-2 text-sm font-medium"
              >
                {isUploadingCover ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    Alterar Capa
                  </>
                )}
              </button>
           </div>
           
           {/* Mobile-friendly button (always visible on corner if desired, but centered overlay works well) */}
           <input 
             ref={coverInputRef} 
             type="file" 
             accept="image/*" 
             className="hidden" 
             onChange={(e) => handleFileChange(e, 'cover')}
           />
        </div>

        <div className="px-4 md:px-6 pb-4 md:pb-6 relative">
          {/* Avatar Area */}
          <div className="absolute -top-10 md:-top-12 left-4 md:left-6">
            <div className="relative group/avatar cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-md bg-slate-200 overflow-hidden relative">
                {formData.avatarUrl ? (
                   <img src={formData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-2xl">
                     {user.name[0]}
                   </div>
                )}
                
                {/* Avatar Upload Overlay */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isUploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover/avatar:opacity-100'}`}>
                    {isUploadingAvatar ? (
                        <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <Camera className="w-6 h-6 text-white" />
                    )}
                </div>
              </div>
              <input 
                ref={avatarInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleFileChange(e, 'avatar')}
              />
            </div>
          </div>

          <div className="pt-12 md:pt-14 flex justify-between items-start">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900">{formData.name}</h2>
              <p className="text-xs md:text-sm text-slate-500 capitalize">{user.type.toLowerCase()}</p>
            </div>
            <div className="flex flex-col items-end">
               <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold ${
                  user.plan === 'PRO' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
               }`}>
                  Plano {user.plan}
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1.5 md:mb-2">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1.5 md:mb-2">Telefone / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(00) 00000-0000"
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1.5 md:mb-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none text-sm"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">O e-mail não pode ser alterado.</p>
            </div>
        </div>

        <div className="border-t border-slate-100 pt-4 md:pt-6">
            <h3 className="text-xs md:text-sm font-bold text-slate-900 mb-3 md:mb-4">Estatísticas</h3>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-slate-50 p-3 md:p-4 rounded-lg">
                    <p className="text-[10px] md:text-xs text-slate-500">Simulações</p>
                    <p className="text-lg md:text-xl font-bold text-slate-900">{user.simulationsCount}</p>
                </div>
                <div className="bg-slate-50 p-3 md:p-4 rounded-lg">
                    <p className="text-[10px] md:text-xs text-slate-500">Status</p>
                    <p className={`text-lg md:text-xl font-bold ${user.plan === 'PRO' ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {user.plan === 'PRO' ? 'Ativo' : 'Básico'}
                    </p>
                </div>
            </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-3 pt-2">
           <button 
             type="button" 
             onClick={onLogout}
             className="w-full md:w-auto flex items-center justify-center gap-2 text-red-500 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm"
           >
             <LogOut className="w-4 h-4" />
             Sair
           </button>

           <button 
             type="submit" 
             disabled={isSaving || isUploadingAvatar || isUploadingCover}
             className="w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
           >
             {isSaving ? 'Salvando...' : 'Salvar Alterações'}
           </button>
        </div>
      </form>
      
      {/* Banner PRO compactado */}
      {user.plan === 'FREE' && (
          <div className="mt-4 md:mt-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 md:p-6 text-white flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                  <div className="p-2 md:p-3 bg-white/10 rounded-lg">
                      <Shield className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                  </div>
                  <div>
                      <h3 className="font-bold text-sm md:text-lg">Upgrade para PRO</h3>
                      <p className="text-slate-300 text-xs md:text-sm">Relatórios ilimitados + Seus dados no PDF.</p>
                  </div>
              </div>
              <button 
                onClick={handleUpgradeClick}
                disabled={isUpgrading}
                className="w-full md:w-auto bg-white text-slate-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors text-xs md:text-sm disabled:opacity-80 flex justify-center items-center gap-2"
              >
                  {isUpgrading ? (
                    <>
                       <div className="w-3 h-3 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                       Processando...
                    </>
                  ) : 'Assinar'}
              </button>
          </div>
      )}
    </div>
  );
};

export default UserProfilePanel;
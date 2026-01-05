import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Camera, Save, LogOut, CreditCard, Shield, Mail, User, Phone } from 'lucide-react';
import { updateUserProfile, logout } from '../utils/auth';

interface Props {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
  onLogout: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
];

const UserProfilePanel: React.FC<Props> = ({ user, onUpdate, onLogout }) => {
  const [formData, setFormData] = useState({ ...user });
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateUserProfile(formData);
      onUpdate(updated);
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-fade-in pb-24 md:pb-8">
      <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">Minha Conta</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="h-20 md:h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-4 md:px-6 pb-4 md:pb-6 relative">
          {/* Avatar */}
          <div className="absolute -top-10 md:-top-12 left-4 md:left-6">
            <div className="relative group">
              <img 
                src={formData.avatarUrl} 
                alt="Profile" 
                className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-md object-cover bg-slate-200"
              />
              <button 
                onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Camera className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </div>

          <div className="pt-12 md:pt-14 flex justify-between items-start">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900">{user.name}</h2>
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

          {/* Avatar Selector */}
          {showAvatarSelector && (
            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in">
              <p className="text-[10px] md:text-xs font-bold text-slate-500 mb-2 md:mb-3 uppercase">Escolha um avatar</p>
              <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {AVATAR_OPTIONS.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                        setFormData({...formData, avatarUrl: url});
                        setShowAvatarSelector(false);
                    }}
                    className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all overflow-hidden ${formData.avatarUrl === url ? 'border-blue-600 scale-110' : 'border-transparent hover:border-blue-300'}`}
                  >
                    <img src={url} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>
          )}
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
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
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
             disabled={isSaving}
             className="w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-sm"
           >
             {isSaving ? 'Salvando...' : 'Salvar'}
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
              <button className="w-full md:w-auto bg-white text-slate-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors text-xs md:text-sm">
                  Assinar
              </button>
          </div>
      )}
    </div>
  );
};

export default UserProfilePanel;
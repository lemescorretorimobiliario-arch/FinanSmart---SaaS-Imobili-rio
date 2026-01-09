import React, { useState } from 'react';
import { Layout, Mail, Lock, User, Eye, EyeOff, ArrowRight, Briefcase, Smile, ShieldAlert } from 'lucide-react';
import { UserProfile } from '../types';
import { loginWithEmail, registerUser, googleLogin } from '../utils/auth';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER';

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Security: Client-side Rate Limiting
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'CORRETOR' | 'CLIENTE'>('CLIENTE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setError('');
    setIsLoading(true);

    try {
      let user: UserProfile;

      if (mode === 'LOGIN') {
        user = await loginWithEmail(email, password);
      } else {
        if (!name) throw new Error('Nome é obrigatório.');
        user = await registerUser({ name, email, password, type: userType });
      }
      
      // Reset attempts on success
      setLoginAttempts(0);
      onLogin(user);
    } catch (err: any) {
      // Security: Rate Limiting Logic
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      let errorMessage = err.message || 'Ocorreu um erro. Tente novamente.';
      
      // If attempts > 3, introduce artificial delay and lock
      if (newAttempts >= 3) {
         setIsLocked(true);
         errorMessage = "Muitas tentativas falhas. Aguarde alguns segundos.";
         setTimeout(() => {
             setIsLocked(false);
         }, 5000 * (newAttempts - 2)); // 5s, 10s, 15s...
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLocked) return;
    setIsLoading(true);
    // Default to client if generic login, or try to infer context. 
    // For demo, we'll just pick CLIENTE unless we are in register mode and selected Corretor
    const type = mode === 'REGISTER' ? userType : 'CLIENTE';
    await googleLogin(type);
    // OAuth redirects, so we don't need to call onLogin manually.
    // The app will re-init on redirect return.
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-600 skew-y-3 origin-top-left transform -translate-y-20"></div>
         <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
         <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden flex flex-col animate-fade-in-up">
        
        {/* Header Section */}
        <div className="pt-8 pb-6 px-8 text-center bg-white">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Bem-vindo ao FinanSmart</h1>
          <p className="text-slate-500 text-sm mt-1">Faça login ou crie sua conta para começar</p>
        </div>

        {/* Tab Switcher */}
        <div className="px-8 mb-6">
          <div className="bg-slate-100 p-1 rounded-xl flex relative">
            {/* Animated Slider Background */}
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${
                mode === 'LOGIN' ? 'left-1' : 'left-[calc(50%+4px)]'
              }`}
            ></div>
            
            <button 
              onClick={() => { setMode('LOGIN'); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg relative z-10 transition-colors ${
                mode === 'LOGIN' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Entrar
            </button>
            <button 
              onClick={() => { setMode('REGISTER'); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg relative z-10 transition-colors ${
                mode === 'REGISTER' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Criar Conta
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          
          {/* Register-only: Name */}
          {mode === 'REGISTER' && (
            <div className="space-y-1 animate-fade-in">
              <label className="text-xs font-bold text-slate-600 uppercase">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-900"
                  placeholder="Seu nome"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-900"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600 uppercase">Senha</label>
                {mode === 'LOGIN' && (
                    <a href="#" className="text-xs text-blue-600 hover:underline">Esqueceu?</a>
                )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-900"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Register-only: User Type */}
          {mode === 'REGISTER' && (
            <div className="space-y-2 animate-fade-in pt-2">
               <label className="text-xs font-bold text-slate-600 uppercase">Você é:</label>
               <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('CLIENTE')}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        userType === 'CLIENTE' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                     <Smile className="w-5 h-5" />
                     <span className="text-xs font-bold">Cliente</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('CORRETOR')}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        userType === 'CORRETOR' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                     <Briefcase className="w-5 h-5" />
                     <span className="text-xs font-bold">Corretor</span>
                  </button>
               </div>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-xs text-center bg-red-50 p-3 rounded-lg flex items-center justify-center gap-2 animate-fade-in">
                {isLocked && <ShieldAlert className="w-4 h-4" />}
                {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading || isLocked}
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : isLocked ? (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  Bloqueado
                </>
            ) : (
                <>
                  {mode === 'LOGIN' ? 'Entrar' : 'Criar Conta'}
                  <ArrowRight className="w-4 h-4" />
                </>
            )}
          </button>

          <div className="relative flex py-2 items-center">
             <div className="flex-grow border-t border-slate-100"></div>
             <span className="flex-shrink-0 mx-4 text-slate-300 text-xs uppercase font-bold">Ou continue com</span>
             <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isLocked}
            className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
             <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
             <span className="text-sm">Google</span>
          </button>

        </form>
      </div>
      
      <p className="absolute bottom-4 text-slate-400 text-xs">
          © {new Date().getFullYear()} FinanSmart. Todos os direitos reservados.
      </p>
    </div>
  );
};

export default AuthScreen;
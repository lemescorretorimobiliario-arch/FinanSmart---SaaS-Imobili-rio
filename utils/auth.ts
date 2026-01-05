import { UserProfile } from '../types';

// Simula banco de dados local
const getStoredUser = (): UserProfile | null => {
  const stored = localStorage.getItem('finansmart_user');
  return stored ? JSON.parse(stored) : null;
};

// Login com Google (Mock)
export const googleLogin = (userType: 'CORRETOR' | 'CLIENTE'): Promise<UserProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stored = getStoredUser();
      if (stored && stored.type === userType) {
        resolve(stored);
        return;
      }

      const mockUser: UserProfile = {
        id: crypto.randomUUID(),
        name: userType === 'CORRETOR' ? 'Carlos Silva' : 'Ana Pereira',
        email: userType === 'CORRETOR' ? 'carlos.realtor@gmail.com' : 'ana.cliente@gmail.com',
        phone: userType === 'CORRETOR' ? '(11) 99999-8888' : undefined,
        avatarUrl: userType === 'CORRETOR' 
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        plan: userType === 'CORRETOR' ? 'PRO' : 'FREE',
        type: userType,
        simulationsCount: userType === 'CORRETOR' ? 142 : 3
      };
      
      localStorage.setItem('finansmart_user', JSON.stringify(mockUser));
      resolve(mockUser);
    }, 1500);
  });
};

// Login com Email e Senha (Novo)
export const loginWithEmail = (email: string, password: string): Promise<UserProfile> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simples verificação mockada
      if (password.length < 6) {
        reject(new Error('Senha incorreta.'));
        return;
      }

      // Tenta recuperar usuário ou cria um baseado no email
      const stored = getStoredUser();
      if (stored && stored.email === email) {
        resolve(stored);
        return;
      }

      // Se não existir, simula um erro ou cria um genérico (para fins de demo, criamos um genérico)
      // Na vida real, retornaria erro de "usuário não encontrado"
      const type = email.includes('imob') || email.includes('corretor') ? 'CORRETOR' : 'CLIENTE';
      
      const mockUser: UserProfile = {
        id: crypto.randomUUID(),
        name: email.split('@')[0].replace(/[0-9]/g, '').replace('.', ' '),
        email: email,
        phone: '(11) 90000-0000',
        avatarUrl: undefined,
        plan: type === 'CORRETOR' ? 'PRO' : 'FREE',
        type: type,
        simulationsCount: 0
      };
      
      localStorage.setItem('finansmart_user', JSON.stringify(mockUser));
      resolve(mockUser);
    }, 1500);
  });
};

// Cadastro de Novo Usuário (Novo)
export const registerUser = (data: { name: string; email: string; password: string; type: 'CORRETOR' | 'CLIENTE' }): Promise<UserProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser: UserProfile = {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        phone: '', // Usuário preenche depois no perfil
        avatarUrl: undefined,
        plan: 'FREE', // Começa free
        type: data.type,
        simulationsCount: 0
      };

      localStorage.setItem('finansmart_user', JSON.stringify(newUser));
      resolve(newUser);
    }, 1500);
  });
};

export const updateUserProfile = (user: UserProfile): Promise<UserProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.setItem('finansmart_user', JSON.stringify(user));
      resolve(user);
    }, 800);
  });
};

export const logout = () => {
  localStorage.removeItem('finansmart_user');
};

export { getStoredUser };
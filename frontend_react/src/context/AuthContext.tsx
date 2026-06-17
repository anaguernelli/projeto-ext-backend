import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ ok: boolean; erro?: string }>;
  logout: () => void;
  register: (dados: any) => Promise<{ ok: boolean; erro?: string; mensagem?: string }>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    const activeToken = localStorage.getItem('token');
    if (!activeToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/me', {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      const data = await res.json();
      if (data.logado) {
        setUser({
          nome: data.nome,
          email: data.email || '',
          role: data.role || 'user',
          metodo: data.metodo
        });
      } else {
        // Token expired or invalid
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Erro ao autenticar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [token]);

  const login = async (email: string, senha: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      const data = await res.json();
      if (data.ok && data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser({
          nome: data.nome,
          email: email,
          role: 'user' // will be verified via next checkAuth or if token contains it, but api_me will resolve it
        });
        return { ok: true };
      } else {
        return { ok: false, erro: data.erro || 'Credenciais inválidas.' };
      }
    } catch (err) {
      return { ok: false, erro: 'Erro de conexão com o servidor.' };
    }
  };

  const logout = async () => {
    const activeToken = localStorage.getItem('token');
    if (activeToken) {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${activeToken}` }
        });
      } catch (e) {
        console.error("Erro no logout remoto", e);
      }
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const register = async (dados: any) => {
    try {
      const res = await fetch('/api/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      const data = await res.json();
      if (data.ok) {
        return { ok: true, mensagem: data.mensagem };
      } else {
        return { ok: false, erro: data.erro || 'Falha no cadastro.' };
      }
    } catch (err) {
      return { ok: false, erro: 'Erro de conexão.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, register, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Pizza } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await login(email, senha);
    setIsLoading(false);

    if (res.ok) {
      navigate('/');
    } else {
      setError(res.erro || 'Falha ao autenticar.');
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center animate-fade-in" style={{ minHeight: '60vh' }}>
      <div className="glass-container p-5 w-100" style={{ maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <Pizza className="text-warning mb-2 animate-bounce mx-auto" size={42} />
          <h2 className="fw-bold text-white mb-1">Acessar Conta</h2>
          <p className="text-muted small">Insira suas credenciais para pedir a sua pizza!</p>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-10 text-danger border-danger border-opacity-20 py-2 px-3 small mb-4" style={{ borderRadius: '10px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label text-light fw-medium d-flex align-items-center gap-2">
              <Mail size={16} /> E-mail
            </label>
            <input 
              type="email" 
              id="email" 
              className="form-input-custom" 
              placeholder="exemplo@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="mb-4">
            <label htmlFor="senha" className="form-label text-light fw-medium d-flex align-items-center gap-2">
              <Lock size={16} /> Senha
            </label>
            <input 
              type="password" 
              id="senha" 
              className="form-input-custom" 
              placeholder="••••••••" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary-custom w-100 py-3 mb-3" disabled={isLoading}>
            {isLoading ? 'Acessando...' : 'Acessar'}
          </button>
        </form>

        <p className="text-muted text-center small mb-0 mt-3">
          Ainda não tem uma conta? <Link to="/cadastro" className="text-warning fw-semibold">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Phone, FileText, MapPin, Compass, Lock } from 'lucide-react';

const validarCPF = (cpf: string): boolean => {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma = soma + parseInt(clean.substring(i - 1, i)) * (11 - i);
  }
  resto = (soma * 10) % 11;

  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(clean.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma = soma + parseInt(clean.substring(i - 1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;

  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(clean.substring(10, 11))) return false;

  return true;
};

const formatarCPF = (value: string) => {
  const apenasDigitos = value.replace(/\D/g, '');
  if (apenasDigitos.length <= 3) return apenasDigitos;
  if (apenasDigitos.length <= 6) return `${apenasDigitos.slice(0, 3)}.${apenasDigitos.slice(3)}`;
  if (apenasDigitos.length <= 9) return `${apenasDigitos.slice(0, 3)}.${apenasDigitos.slice(3, 6)}.${apenasDigitos.slice(6)}`;
  return `${apenasDigitos.slice(0, 3)}.${apenasDigitos.slice(3, 6)}.${apenasDigitos.slice(6, 9)}-${apenasDigitos.slice(9, 11)}`;
};

const formatarTelefone = (value: string) => {
  const apenasDigitos = value.replace(/\D/g, '');
  if (apenasDigitos.length === 0) return '';
  if (apenasDigitos.length <= 2) return `(${apenasDigitos}`;
  if (apenasDigitos.length <= 6) return `(${apenasDigitos.slice(0, 2)}) ${apenasDigitos.slice(2)}`;
  if (apenasDigitos.length <= 10) return `(${apenasDigitos.slice(0, 2)}) ${apenasDigitos.slice(2, 6)}-${apenasDigitos.slice(6)}`;
  return `(${apenasDigitos.slice(0, 2)}) ${apenasDigitos.slice(2, 7)}-${apenasDigitos.slice(7, 11)}`;
};

export const Register: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [endereco, setEndereco] = useState('');
  const [referencia, setReferencia] = useState('');
  const [senha, setSenha] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatarTelefone(e.target.value));
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatarCPF(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação de formato de E-mail
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um formato de e-mail válido.');
      return;
    }

    // Validação de formato de Telefone
    const cleanTelefone = telefone.replace(/\D/g, '');
    if (cleanTelefone.length < 10 || cleanTelefone.length > 11) {
      setError('O telefone deve conter o DDD e ter 10 ou 11 dígitos.');
      return;
    }

    // Validação de formato/dígitos de CPF
    if (!validarCPF(cpf)) {
      setError('Por favor, insira um CPF válido.');
      return;
    }

    setIsLoading(true);

    const dados = {
      nome,
      email,
      telefone,
      cpf,
      endereco,
      senha,
      referencia
    };

    const res = await register(dados);
    setIsLoading(false);

    if (res.ok) {
      alert(res.mensagem || 'Cadastro realizado com sucesso! Efetue login para continuar.');
      navigate('/login');
    } else {
      setError(res.erro || 'Falha ao registrar.');
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center animate-fade-in">
      <div className="glass-container p-5 w-100" style={{ maxWidth: '600px' }}>
        <div className="text-center mb-4">
          <UserPlus className="text-warning mb-2 mx-auto" size={42} />
          <h2 className="fw-bold text-white mb-1">Criar Conta</h2>
          <p className="text-muted small">Crie seu perfil e aproveite o melhor cardápio de Campo Grande!</p>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-10 text-danger border-danger border-opacity-20 py-2 px-3 small mb-4" style={{ borderRadius: '10px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label htmlFor="nome" className="form-label text-light fw-medium d-flex align-items-center gap-2">
                <User size={16} /> Nome Completo
              </label>
              <input 
                type="text" 
                id="nome" 
                className="form-input-custom" 
                placeholder="Ex: João da Silva" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required 
              />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="email" className="form-label text-light fw-medium d-flex align-items-center gap-2">
                <Mail size={16} /> E-mail
              </label>
              <input 
                type="email" 
                id="email" 
                className="form-input-custom" 
                placeholder="joao@exemplo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="telefone" className="form-label text-light fw-medium d-flex align-items-center gap-2">
                <Phone size={16} /> Telefone
              </label>
              <input 
                type="text" 
                id="telefone" 
                className="form-input-custom" 
                placeholder="Ex: (67) 99999-9999" 
                value={telefone}
                onChange={handleTelefoneChange}
                required 
              />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="cpf" className="form-label text-light fw-medium d-flex align-items-center gap-2">
                <FileText size={16} /> CPF
              </label>
              <input 
                type="text" 
                id="cpf" 
                className="form-input-custom" 
                placeholder="Ex: 000.111.222-33" 
                value={cpf}
                onChange={handleCpfChange}
                required 
              />
            </div>

            <div className="col-12">
              <label htmlFor="endereco" className="form-label text-light fw-medium d-flex align-items-center gap-2">
                <MapPin size={16} /> Endereço Residencial
              </label>
              <input 
                type="text" 
                id="endereco" 
                className="form-input-custom" 
                placeholder="Rua, Número, Bairro" 
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                required 
              />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="referencia" className="form-label text-light fw-medium d-flex align-items-center gap-2">
                <Compass size={16} /> Ponto de Referência
              </label>
              <input 
                type="text" 
                id="referencia" 
                className="form-input-custom" 
                placeholder="Ex: Atrás do mercado" 
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="senha" className="form-label text-light fw-medium d-flex align-items-center gap-2">
                <Lock size={16} /> Senha de Acesso
              </label>
              <input 
                type="password" 
                id="senha" 
                className="form-input-custom" 
                placeholder="Mínimo 6 caracteres" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn-primary-custom w-100 py-3 mt-4 mb-3" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Cadastrar e Criar Conta'}
          </button>
        </form>

        <p className="text-muted text-center small mb-0 mt-3">
          Já possui uma conta ativa? <Link to="/login" className="text-warning fw-semibold">Faça Login</Link>
        </p>
      </div>
    </div>
  );
};

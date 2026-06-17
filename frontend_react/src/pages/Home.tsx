import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pizza, ArrowRight, ShieldCheck, Clock, Award, Star, Send } from 'lucide-react';

export const Home: React.FC = () => {
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/avaliacoes')
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.avaliacoes) {
          setAvaliacoes(data.avaliacoes);
        }
      })
      .catch(err => console.error("Erro ao buscar avaliacoes:", err));
  }, []);

  return (
    <div className="animate-fade-in pb-5">
      {/* Hero Section */}
      <section className="position-relative py-5 overflow-hidden" style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(151,0,0,0.1) 0%, transparent 100%)'
      }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6 text-start">

              <h1 className="display-4 fw-bold text-white mb-3" style={{ lineHeight: 1.2 }}>
                Uma Explosão de Sabores em Cada Fatia!
              </h1>
              <p className="lead text-muted mb-4" style={{ fontSize: '1.15rem' }}>
                Ingredientes selecionados, massa artesanal crocante de fermentação lenta e assada no ponto perfeito. Venha provar e entender o porquê do nosso nome!
              </p>
              <div className="d-flex gap-3">
                <Link to="/cardapio" className="btn-primary-custom">
                  Ver Cardápio <ArrowRight size={18} />
                </Link>
                <Link to="/sobre" className="btn-outline-custom">
                  Nossa História
                </Link>
              </div>
            </div>
            <div className="col-12 col-lg-6 text-center position-relative">
              <div className="position-absolute top-50 start-50 translate-middle bg-danger bg-opacity-10 rounded-circle filter-blur" style={{ width: '400px', height: '400px', filter: 'blur(80px)', zIndex: -1 }}></div>
              <img 
                src="/static/image/calabresa.jpeg" 
                alt="Pizza de Calabresa" 
                className="img-fluid rounded-circle shadow-lg border border-secondary border-opacity-25" 
                style={{ maxWidth: '85%', transform: 'rotate(-5deg)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Destaques / Diferenciais */}
      <section className="container py-5">
        <div className="row g-4 text-start">
          <div className="col-12 col-md-4">
            <div className="glass-container p-4 h-100">
              <Award className="text-warning mb-3" size={36} />
              <h5 className="fw-bold mb-2">Ingredientes Premium</h5>
              <p className="text-muted small">Trabalhamos apenas com mussarela de cura artesanal, molho de tomate italiano pelati e carnes de alta qualidade.</p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="glass-container p-4 h-100">
              <Clock className="text-warning mb-3" size={36} />
              <h5 className="fw-bold mb-2">Entrega Ultra Rápida</h5>
              <p className="text-muted small">Nossos entregadores conhecem a cidade como ninguém. Sua pizza chega quentinha na sua mesa em tempo recorde.</p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="glass-container p-4 h-100">
              <ShieldCheck className="text-warning mb-3" size={36} />
              <h5 className="fw-bold mb-2">Qualidade Garantida</h5>
              <p className="text-muted small">Seja no atendimento, na higiene ou na embalagem, a nossa dedicação à excelência é inegociável.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-5" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <h2 className="text-center fw-bold mb-2">O Que Dizem Nossos Clientes</h2>
          <p className="text-center text-muted mb-5">Quem come uma vez, vira fã para sempre!</p>
          
          <div className="row g-4 text-start">
            {avaliacoes.length > 0 ? avaliacoes.slice(0, 3).map((av) => (
              <div key={av.id} className="col-12 col-md-6 col-lg-4">
                <div className="glass-container p-4 h-100">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '48px', height: '48px' }}>
                      {(av.usuario_nome || 'Anônimo').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">{av.usuario_nome || 'Anônimo'}</h6>
                      <div className="text-warning">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < av.estrelas ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted small italic">"{av.comentario || 'Avaliação sem comentário.'}"</p>
                </div>
              </div>
            )) : (
              <p className="text-muted text-center w-100 py-3">Ainda não temos avaliações. Faça o seu pedido e seja o primeiro!</p>
            )}
          </div>
        </div>
      </section>

      {/* Contato Section */}
      <section className="container py-5">
        <div className="glass-container p-5 text-start">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-6">
              <h2 className="fw-bold text-white mb-3">Dúvidas ou Sugestões?</h2>
              <p className="text-muted mb-4">Mande uma mensagem para nós! Adoramos ouvir nossos clientes e estamos prontos para lhe ajudar.</p>
              <div className="d-flex flex-column gap-2 text-muted small">
                <span>📍 Av. Principal, 404 - Campo Grande, MS</span>
                <span>📞 (67) 4002-8922</span>
                <span>✉ contato@pizzaria404.com.br</span>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <form onSubmit={(e) => { e.preventDefault(); alert('Mensagem enviada com sucesso!'); }}>
                <div className="mb-3">
                  <input type="text" className="form-input-custom" placeholder="Seu Nome" required />
                </div>
                <div className="mb-3">
                  <input type="email" className="form-input-custom" placeholder="Seu E-mail" required />
                </div>
                <div className="mb-3">
                  <textarea className="form-input-custom" rows={3} placeholder="Sua Mensagem" required></textarea>
                </div>
                <button type="submit" className="btn-primary-custom w-100">
                  Enviar Mensagem <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

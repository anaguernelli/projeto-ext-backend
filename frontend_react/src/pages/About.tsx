import React from 'react';
import { Pizza, Users, Star, Heart } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="container py-5 animate-fade-in text-start">
      <div className="glass-container p-5 mb-5">
        <h1 className="display-5 fw-bold text-center mb-4" style={{ background: 'linear-gradient(90deg, #fff 0%, #F4D03F 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Quem Somos
        </h1>
        <p className="lead text-muted text-center mb-5" style={{ maxWidth: '800px', margin: '0 auto' }}>
          Unindo tecnologia e culinária tradicional, nascemos com a missão de entregar fatias inesquecíveis de felicidade diretamente na sua porta.
        </p>

        <div className="row g-5 align-items-center">
          <div className="col-12 col-lg-6">
            <h3 className="fw-bold text-white mb-3">A Nossa História</h3>
            <p className="text-muted mb-3">
              A Pizzaria 404 foi fundada em 2025 com uma proposta inusitada: brincar com a temática "not found" da tecnologia, mas garantindo que o sabor perfeito é algo que você **sempre encontra** aqui.
            </p>
            <p className="text-muted mb-3">
              Tudo começou em uma pequena garagem familiar, onde desenvolvemos a nossa famosa massa de fermentação lenta (48 horas). A resposta do bairro foi imediata, e logo o espaço ficou pequeno para tanta pizza.
            </p>
            <p className="text-muted">
              Hoje, somos referência em Campo Grande, unindo receitas italianas clássicas com sabores locais inovadores, mantendo sempre o processo artesanal que nos trouxe até aqui.
            </p>
          </div>
          <div className="col-12 col-lg-6 text-center">
            <img 
              src="/static/image/pizza fundo.jpeg" 
              alt="Pizzaria por dentro" 
              className="img-fluid rounded shadow-lg border border-secondary border-opacity-25" 
              style={{ maxHeight: '350px', objectFit: 'cover', width: '100%' }} 
            />
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-12 col-md-4">
          <div className="glass-container p-4 text-center">
            <Users className="text-warning mb-3 mx-auto" size={32} />
            <h5 className="fw-bold">Nossa Equipe</h5>
            <p className="text-muted small">Pizzaiolos dedicados e apaixonados com anos de treinamento e experiência internacional.</p>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="glass-container p-4 text-center">
            <Star className="text-warning mb-3 mx-auto" size={32} />
            <h5 className="fw-bold">Nossa Qualidade</h5>
            <p className="text-muted small">Forno a lenha de alta performance e ingredientes importados rigorosamente selecionados.</p>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="glass-container p-4 text-center">
            <Heart className="text-warning mb-3 mx-auto" size={32} />
            <h5 className="fw-bold">Nossa Paixão</h5>
            <p className="text-muted small">Para nós, pizza é arte. Cada detalhe, da borda ao molho, é feito com carinho.</p>
          </div>
        </div>
      </div>

      {/* Fundadores */}
      <div className="glass-container p-5">
        <h3 className="fw-bold text-white text-center mb-5">Nossos Fundadores</h3>
        <div className="row g-4 text-center">
          <div className="col-12 col-md-4">
            <img src="/static/image/fundador1.png" alt="Fundador 1" className="rounded-circle mb-3 border border-secondary border-opacity-25" style={{ width: '120px', height: '120px', objectFit: 'cover' }} onError={(e) => { (e.target as any).src = '/static/image/icone.png' }} />
            <h5 className="fw-bold text-white mb-1">Luigi Rossi</h5>
            <p className="text-warning small mb-2">Chef Pizzaiolo</p>
            <p className="text-muted small">Especialista em fermentação lenta e molhos artesanais.</p>
          </div>
          <div className="col-12 col-md-4">
            <img src="/static/image/fundador2 (1).png" alt="Fundadora 2" className="rounded-circle mb-3 border border-secondary border-opacity-25" style={{ width: '120px', height: '120px', objectFit: 'cover' }} onError={(e) => { (e.target as any).src = '/static/image/icone.png' }} />
            <h5 className="fw-bold text-white mb-1">Beatriz Medeiros</h5>
            <p className="text-warning small mb-2">Diretora de Operações</p>
            <p className="text-muted small">Garante a logística perfeita para que sua pizza chegue quentinha.</p>
          </div>
          <div className="col-12 col-md-4">
            <img src="/static/image/fundador3.png" alt="Fundador 3" className="rounded-circle mb-3 border border-secondary border-opacity-25" style={{ width: '120px', height: '120px', objectFit: 'cover' }} onError={(e) => { (e.target as any).src = '/static/image/icone.png' }} />
            <h5 className="fw-bold text-white mb-1">Carlos Augusto</h5>
            <p className="text-warning small mb-2">Sommelier & Relacionamento</p>
            <p className="text-muted small">Cuidadoso na seleção de parceiros e vinhos ideais.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

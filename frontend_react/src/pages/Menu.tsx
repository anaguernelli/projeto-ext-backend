import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Pizza, Sparkles, Award } from 'lucide-react';

export const Menu: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/produtos');
        const data = await res.json();
        if (data.ok) {
          setProducts(data.produtos || []);
        }
      } catch (err) {
        console.error('Erro ao buscar produtos do cardápio:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const renderCategory = (categoryName: string, title: string, icon: React.ReactNode) => {
    const filtered = products.filter(p => p.categoria === categoryName);

    if (filtered.length === 0) return null;

    return (
      <div key={categoryName} className="mb-5">
        <h3 className="text-warning mb-4 d-flex align-items-center gap-2 justify-content-center">
          {icon} {title}
        </h3>
        <div className="row g-4 justify-content-center">
          {filtered.map(prod => (
            <div key={prod.id} className="col-12 col-sm-6 col-md-4">
              <div className="glass-container pizza-card h-100 d-flex flex-column text-start" style={{ overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                  <img 
                    src={`/static/image/${prod.foto}`} 
                    alt={prod.nome} 
                    className="w-100 h-100" 
                    style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
                    onError={(e) => { (e.target as any).src = '/static/image/icone.png' }}
                    onMouseOver={(e) => { (e.target as any).style.transform = 'scale(1.05)' }}
                    onMouseOut={(e) => { (e.target as any).style.transform = 'scale(1)' }}
                  />
                  <span className="position-absolute top-3 end-3 badge bg-dark bg-opacity-75 px-3 py-2" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    R$ {prod.preco.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="p-4 d-flex flex-column flex-grow-1">
                  <h5 className="fw-bold text-white mb-2">{prod.nome}</h5>
                  <p className="text-muted small mb-4 flex-grow-1">{prod.descricao}</p>
                  
                  {prod.tags && prod.tags.length > 0 && (
                    <div className="mb-4 d-flex flex-wrap gap-1">
                      {prod.tags.map((tag, idx) => (
                        <span key={idx} className="badge bg-secondary bg-opacity-25 text-muted px-2 py-1" style={{ fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link 
                    to={`/carrinho?item=${encodeURIComponent(prod.nome)}`} 
                    className="btn-outline-custom text-center justify-content-center w-100"
                    style={{ borderColor: 'var(--secondary)', color: 'var(--secondary)' }}
                  >
                    Personalizar & Pedir
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container py-5 animate-fade-in text-center">
      <div className="mb-5">
        <h1 className="display-5 fw-bold mb-2" style={{ background: 'linear-gradient(90deg, #fff 0%, #F4D03F 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Cardápio Completo
        </h1>
        <p className="text-muted lead">Pizzas artesanais assadas na hora com os melhores ingredientes.</p>
      </div>

      {isLoading ? (
        <div className="row g-4 justify-content-center">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="col-12 col-sm-6 col-md-4">
              <div className="skeleton-card">
                <div className="skeleton-image skeleton-shimmer" />
                <div className="skeleton-title skeleton-shimmer" />
                <div className="skeleton-text skeleton-shimmer" />
                <div className="skeleton-text skeleton-shimmer" style={{ width: '70%' }} />
                <div className="skeleton-button skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          {renderCategory('Populares', '🍕 Pizzas Populares', <Award size={20} />)}
          {renderCategory('Doces', '🍫 Pizzas Doces', <Sparkles size={20} />)}
          {renderCategory('Especiais', '⭐ Pizzas Especiais', <Pizza size={20} />)}
        </div>
      )}
    </div>
  );
};

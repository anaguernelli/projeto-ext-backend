import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Order, OrderItem } from '../types';
import { Clock, CheckCircle, Package, Truck, Compass, ArrowRight, Eye, X, Receipt, Pizza } from 'lucide-react';

const STATUS_SEQUENCE = ["RECEBIDO", "PREPARANDO", "EM_ROTA_DE_ENTREGA", "ENTREGUE"];

export const OrdersTracking: React.FC = () => {
  const { token } = useAuth();
  const { cartItems } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // Review state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewPedidoId, setReviewPedidoId] = useState<number | null>(null);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const pollingRef = useRef<any>(null);

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/pedidos/historico', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        const history: Order[] = data.historico || [];
        setOrders(history);

        // Find the most recent active/open order to poll
        const active = history.find(o => o.status !== 'ENTREGUE');
        if (active) {
          setActiveOrder(active);
        } else {
          setActiveOrder(null);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar histórico de pedidos:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const submitReview = async () => {
    if (!token || !reviewPedidoId) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/pedido/avaliar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pedido_id: reviewPedidoId,
          estrelas: reviewStars,
          comentario: reviewComment
        })
      });
      const data = await res.json();
      if (data.ok) {
        alert("Avaliação enviada com sucesso! Obrigado.");
        setReviewModalOpen(false);
      } else {
        alert(data.erro || "Erro ao enviar avaliação.");
      }
    } catch (err) {
      alert("Erro de conexão.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Poll order status
  const startPolling = (pedidoId: number) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/pedido/${pedidoId}/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.status === 200 && data.status) {
          const newStatus = data.status;

          // Update active order locally
          setActiveOrder(prev => prev ? { ...prev, status: newStatus } : null);

          // Update in the orders history list
          setOrders(prev => prev.map(o => o.pedido_id === pedidoId ? { ...o, status: newStatus } : o));

          if (newStatus === 'ENTREGUE') {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            alert(`Oba! Seu pedido #${pedidoId} foi entregue! Aproveite a sua pizza! 🍕`);
            fetchHistory();
          }
        }
      } catch (err) {
        console.error('Erro no polling de status:', err);
      }
    }, 5000);
  };

  useEffect(() => {
    fetchHistory();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [token]);

  useEffect(() => {
    if (activeOrder && activeOrder.status !== 'ENTREGUE') {
      startPolling(activeOrder.pedido_id);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [activeOrder?.pedido_id]);

  const viewOrderDetails = async (pedidoId: number) => {
    try {
      const res = await fetch(`/api/pedido/${pedidoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        setSelectedOrderDetails(data);
        setIsModalOpen(true);
      } else {
        alert("Erro ao buscar detalhes: " + data.erro);
      }
    } catch (err) {
      console.error('Erro ao buscar detalhes do pedido:', err);
    }
  };

  const getStepClass = (currentStatus: string, stepName: string) => {
    const currentIdx = STATUS_SEQUENCE.indexOf(currentStatus);
    const stepIdx = STATUS_SEQUENCE.indexOf(stepName);
    if (currentIdx === stepIdx) return 'active';
    if (stepIdx < currentIdx) return 'completed';
    return '';
  };

  const getProgressWidth = (status: string) => {
    const idx = STATUS_SEQUENCE.indexOf(status);
    if (idx <= 0) return '0%';
    const pct = (idx / (STATUS_SEQUENCE.length - 1)) * 100;
    return `${pct}%`;
  };

  const formatStatusText = (status: string) => {
    const map: any = {
      'RECEBIDO': 'Pedido Recebido',
      'PREPARANDO': 'Preparando sua Pizza',
      'EM_ROTA_DE_ENTREGA': 'Em Rota de Entrega',
      'ENTREGUE': 'Entregue com Sucesso'
    };
    return map[status] || status;
  };

  return (
    <>
      <div className="container py-5 animate-fade-in text-start">
      <style>{`
        /* ESTILOS DO STEPPER DE RASTREAMENTO */
        .track-stepper-container {
          position: relative;
          display: flex;
          justify-content: space-between;
          margin-top: 24px;
        }
        .track-stepper-bg-line {
          position: absolute;
          top: 20px; left: 0; right: 0;
          height: 4px;
          background: #2d2d30;
          z-index: 1;
        }
        .track-stepper-fill-line {
          position: absolute;
          top: 20px; left: 0;
          height: 4px;
          background: #27ae60;
          z-index: 2;
          transition: width 0.4s ease;
        }
        .track-step-node {
          position: relative;
          z-index: 3;
          width: 25%;
          text-align: center;
        }
        .track-step-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #18181b;
          border: 3px solid #3f3f46;
          color: #71717a;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          transition: all 0.3s;
        }
        .track-step-node.completed .track-step-circle {
          background: #27ae60;
          border-color: #27ae60;
          color: #fff;
        }
        .track-step-node.active .track-step-circle {
          background: #970000;
          border-color: #970000;
          color: #fff;
          box-shadow: 0 0 15px rgba(151,0,0,0.6);
          animation: pulse-active 2s infinite;
        }
        @keyframes pulse-active {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .track-step-label {
          margin-top: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #71717a;
        }
        .track-step-node.completed .track-step-label { color: #27ae60; }
        .track-step-node.active .track-step-label { color: #fff; }

        /* Modal Overlay */
        .modal-overlay-custom {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        /* Mapa Animado */
        .delivery-map-container {
          position: relative;
          height: 120px;
          background-color: #1e1e1e;
          border-radius: 8px;
          overflow: hidden;
          margin-top: 24px;
          border: 1px solid #3f3f46;
          background-image: radial-gradient(#3f3f46 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .map-path {
          position: absolute;
          top: 50%; left: 10%; right: 10%;
          height: 2px;
          background: dashed 2px #555;
          transform: translateY(-50%);
          border-top: 2px dashed #71717a;
        }
        .motoboy-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%) scaleX(-1);
          color: #f1c40f;
          animation: ride 30s linear forwards;
        }
        @keyframes ride {
          0% { left: 10%; }
          100% { left: 90%; }
        }
        .store-icon { position: absolute; left: 8%; top: 50%; transform: translateY(-50%); color: #e74c3c; z-index: 2; }
        .home-icon { position: absolute; right: 8%; top: 50%; transform: translateY(-50%); color: #2ecc71; z-index: 2; }
      `}</style>

      {/* 1. ACTIVE ORDER TRACKING WIDGET */}
      {activeOrder && (
        <div className="glass-container p-4 mb-5 border-success border-opacity-20" style={{ background: 'linear-gradient(180deg, rgba(39,174,96,0.05) 0%, rgba(0,0,0,0.2) 100%)' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>

              <h3 className="fw-bold text-white mb-0 mt-1">Acompanhe Seu Pedido #{activeOrder.pedido_id}</h3>
            </div>
            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold font-monospace">
              {formatStatusText(activeOrder.status)}
            </span>
          </div>

          <div className="track-stepper-container px-2 py-4">
            <div className="track-stepper-bg-line"></div>
            <div className="track-stepper-fill-line" style={{ width: getProgressWidth(activeOrder.status) }}></div>

            <div className={`track-step-node ${getStepClass(activeOrder.status, 'RECEBIDO')}`}>
              <div className="track-step-circle"><Receipt size={16} /></div>
              <div className="track-step-label">Recebido</div>
            </div>
            <div className={`track-step-node ${getStepClass(activeOrder.status, 'PREPARANDO')}`}>
              <div className="track-step-circle"><Package size={16} /></div>
              <div className="track-step-label">Preparando</div>
            </div>
            <div className={`track-step-node ${getStepClass(activeOrder.status, 'EM_ROTA_DE_ENTREGA')}`}>
              <div className="track-step-circle"><Truck size={16} /></div>
              <div className="track-step-label">Em Rota</div>
            </div>
            <div className={`track-step-node ${getStepClass(activeOrder.status, 'ENTREGUE')}`}>
              <div className="track-step-circle"><CheckCircle size={16} /></div>
              <div className="track-step-label">Entregue</div>
            </div>
          </div>

          {/* Simulated Map when EM_ROTA_DE_ENTREGA */}
          {activeOrder.status === 'EM_ROTA_DE_ENTREGA' && (
            <div className="delivery-map-container animate-fade-in shadow-lg">
              <div className="store-icon"><Receipt size={24} /></div>
              <div className="map-path"></div>
              <div className="home-icon"><CheckCircle size={24} /></div>
              <div className="motoboy-icon">
                <Truck size={32} />
              </div>
              <div className="text-center w-100 position-absolute bottom-0 mb-2 small fw-bold text-warning" style={{ textShadow: '0 0 5px black' }}>
                O motoboy está a caminho do seu endereço!
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. ORDER HISTORY LIST */}
      <div className="row g-4">
        {/* Left Side: Go to Checkout if Cart is not empty */}
        {cartItems.length > 0 && (
          <div className="col-12 col-md-4">
            <div className="glass-container p-4 text-center">
              <h5 className="fw-bold text-white mb-3">Você Tem Itens No Carrinho!</h5>
              <p className="text-muted small mb-4">Finalize o seu pedido pendente para que nossos pizzaiolos comecem a trabalhar.</p>
              <Link to="/carrinho" className="btn-primary-custom w-100">
                Ir Para o Checkout <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* Main list */}
        <div className={cartItems.length > 0 ? "col-12 col-md-8" : "col-12"}>
          <div className="glass-container p-4">
            <h4 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
              <Clock size={20} className="text-warning" /> Histórico de Pedidos
            </h4>

            {isHistoryLoading ? (
              <div className="table-responsive">
                <table className="table align-middle" style={{ color: '#d1d5db', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <thead>
                    <tr style={{ color: '#71717a', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th>Pedido ID</th>
                      <th>Data</th>
                      <th>Status</th>
                      <th>Total Pago</th>
                      <th className="text-end">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td><div className="skeleton-shimmer" style={{ height: '18px', width: '60px', borderRadius: '4px' }} /></td>
                        <td><div className="skeleton-shimmer" style={{ height: '14px', width: '120px', borderRadius: '4px' }} /></td>
                        <td><div className="skeleton-shimmer" style={{ height: '20px', width: '100px', borderRadius: '10px' }} /></td>
                        <td><div className="skeleton-shimmer" style={{ height: '16px', width: '70px', borderRadius: '4px' }} /></td>
                        <td className="text-end"><div className="skeleton-shimmer ms-auto" style={{ height: '28px', width: '80px', borderRadius: '8px' }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p className="mb-2">Nenhum pedido finalizado anteriormente.</p>
                <Link to="/cardapio" className="btn-outline-custom btn-sm mt-3">Ir Para o Cardápio</Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle" style={{ color: '#d1d5db', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <thead>
                    <tr style={{ color: '#71717a', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th>Pedido ID</th>
                      <th>Data</th>
                      <th>Status</th>
                      <th>Total Pago</th>
                      <th className="text-end">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.pedido_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="fw-bold text-light">#{o.pedido_id}</td>
                        <td className="small font-monospace">{o.data}</td>
                        <td>
                          <span className={`badge px-2 py-1 rounded ${o.status === 'ENTREGUE' ? 'bg-success bg-opacity-25 text-success' : 'bg-warning bg-opacity-25 text-warning'
                            }`} style={{ fontSize: '0.75rem' }}>
                            {formatStatusText(o.status)}
                          </span>
                        </td>
                        <td className="fw-semibold text-warning">
                          R$ {(o.total_pago || 0).toFixed(2).replace('.', ',')}
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            {o.status === 'ENTREGUE' && (
                              <button
                                onClick={() => { setReviewPedidoId(o.pedido_id); setReviewModalOpen(true); }}
                                className="btn btn-sm btn-outline-warning py-1 px-2"
                                style={{ fontSize: '0.8rem' }}
                              >
                                ⭐ Avaliar
                              </button>
                            )}
                            <button
                              onClick={() => viewOrderDetails(o.pedido_id)}
                              className="btn-outline-custom btn-sm py-1 px-2"
                              style={{ fontSize: '0.8rem' }}
                            >
                              <Eye size={14} /> Detalhes
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* 3. ORDER DETAILS DIALOG MODAL */}
      {isModalOpen && selectedOrderDetails && (
        <div className="modal-overlay-custom" onClick={() => setIsModalOpen(false)}>
          <div className="react-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', width: '95%' }}>
            <div className="modal-header px-4 py-3" style={{ backgroundColor: '#970000', color: '#fff', borderBottom: 'none', flexShrink: 0 }}>
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                <Receipt size={20} /> Detalhes do Pedido #{selectedOrderDetails.pedido_id}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              />
            </div>

            <div className="modal-body p-4" style={{ overflowY: 'auto' }}>
              {/* Stepper tracking inside Modal */}
              <div className="p-3 mb-4 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted small fw-bold">ACOMPANHAMENTO DO STATUS</span>
                  <span className={`badge rounded-pill px-3 py-1 font-monospace ${selectedOrderDetails.status === 'ENTREGUE' ? 'bg-success text-white' : 'bg-warning text-dark'
                    }`} style={{ fontSize: '10px' }}>
                    {formatStatusText(selectedOrderDetails.status)}
                  </span>
                </div>

                {/* Stepper nodes inside Modal */}
                <div className="track-stepper-container px-2 py-3">
                  <div className="track-stepper-bg-line" style={{ top: '21px' }}></div>
                  <div className="track-stepper-fill-line" style={{ top: '21px', width: getProgressWidth(selectedOrderDetails.status) }}></div>

                  <div className={`track-step-node ${getStepClass(selectedOrderDetails.status, 'RECEBIDO')}`}>
                    <div className="track-step-circle" style={{ width: '36px', height: '36px' }}><Receipt size={14} /></div>
                    <div className="track-step-label" style={{ fontSize: '10px' }}>Recebido</div>
                  </div>
                  <div className={`track-step-node ${getStepClass(selectedOrderDetails.status, 'PREPARANDO')}`}>
                    <div className="track-step-circle" style={{ width: '36px', height: '36px' }}><Package size={14} /></div>
                    <div className="track-step-label" style={{ fontSize: '10px' }}>Preparando</div>
                  </div>
                  <div className={`track-step-node ${getStepClass(selectedOrderDetails.status, 'EM_ROTA_DE_ENTREGA')}`}>
                    <div className="track-step-circle" style={{ width: '36px', height: '36px' }}><Truck size={14} /></div>
                    <div className="track-step-label" style={{ fontSize: '10px' }}>Em Rota</div>
                  </div>
                  <div className={`track-step-node ${getStepClass(selectedOrderDetails.status, 'ENTREGUE')}`}>
                    <div className="track-step-circle" style={{ width: '36px', height: '36px' }}><CheckCircle size={14} /></div>
                    <div className="track-step-label" style={{ fontSize: '10px' }}>Entregue</div>
                  </div>
                </div>
              </div>

              {/* Delivery and Finance Details info grids */}
              <div className="row g-4 mb-4">
                <div className="col-12 col-md-6 text-start">
                  <div className="card h-100 p-3 border-0" style={{ backgroundColor: 'rgba(244, 208, 63, 0.05)', border: '1px solid rgba(244, 208, 63, 0.15)', borderRadius: '12px' }}>
                    <h6 className="text-danger fw-bold mb-3" style={{ fontSize: '0.95rem' }}><Truck size={16} /> Entrega</h6>
                    <div className="mb-2">
                      <span className="text-muted d-block" style={{ fontSize: '10px', fontWeight: 600 }}>ENDEREÇO</span>
                      <span className="text-light fw-medium" style={{ fontSize: '13px' }}>{selectedOrderDetails.endereco_entrega}</span>
                    </div>
                    <div>
                      <span className="text-muted d-block" style={{ fontSize: '10px', fontWeight: 600 }}>PAGAMENTO</span>
                      <span className="text-light fw-medium" style={{ fontSize: '13px' }}>{selectedOrderDetails.forma_pagamento}</span>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6 text-start">
                  <div className="card h-100 p-3 border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
                    <h6 className="text-light fw-bold mb-3" style={{ fontSize: '0.95rem' }}><Receipt size={16} /> Resumo Financeiro</h6>
                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '13px' }}>
                      <span className="text-muted">Valor Frete</span>
                      <span className="text-light fw-semibold">R$ {(selectedOrderDetails.valor_frete || 0).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: '13px' }}>
                      <span className="text-muted">Realizado em</span>
                      <span className="text-muted font-monospace">{selectedOrderDetails.data}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary border-opacity-20">
                      <span className="fw-bold text-light" style={{ fontSize: '14px' }}>Total Pago</span>
                      <span className="text-danger fw-bold" style={{ fontSize: '1.2rem' }}>
                        R$ {(selectedOrderDetails.total_pago || 0).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List in details */}
              <h6 className="text-danger fw-bold mb-2 px-1"><Pizza size={16} /> Itens do Pedido</h6>
              <div className="card p-2 border-0" style={{ borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle text-start mb-0 bg-transparent" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr className="text-muted border-secondary border-opacity-20 border-bottom" style={{ fontSize: '11px', fontWeight: 700 }}>
                        <th>Produto</th>
                        <th>Qtd</th>
                        <th>Obs</th>
                        <th className="text-end">Unitário</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrderDetails.itens || []).map(item => (
                        <tr key={item.id}>
                          <td>
                            <strong className="text-light">{item.nome}</strong>
                            <div className="text-muted small mt-1">
                              {item.tamanho === 'P' ? 'Pequena' : item.tamanho === 'G' ? 'Grande' : 'Média'}
                              {item.tipo_borda !== 'Tradicional' && ` • Borda: ${item.tipo_borda}`}
                              {item.ingredientes_extras && item.ingredientes_extras !== '[]' && (
                                <span className="d-block mt-1 text-secondary">
                                  + {JSON.parse(item.ingredientes_extras).join(', ')}
                                </span>
                              )}
                              {item.observacao && <span className="d-block mt-1 text-secondary">Obs: {item.observacao}</span>}
                            </div>
                          </td>
                          <td className="text-light">{item.quantidade}</td>
                          <td className="text-muted italic">{item.observacao || '-'}</td>
                          <td className="text-light text-end">R$ {(item.valor_unitario || 0).toFixed(2).replace('.', ',')}</td>
                          <td className="text-end fw-semibold text-danger">R$ {(item.subtotal || 0).toFixed(2).replace('.', ',')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="modal-footer px-4 py-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', flexShrink: 0 }}>
              <button
                type="button"
                className="btn-red-custom py-2 px-4"
                style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                onClick={() => setIsModalOpen(false)}
              >
                Fechar Recibo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. REVIEW MODAL */}
      {reviewModalOpen && reviewPedidoId && (
        <div className="modal-overlay-custom" onClick={() => setReviewModalOpen(false)}>
          <div className="react-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', width: '95%' }}>
            <div className="modal-header">
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                <span className="text-warning">⭐</span> Avaliar Pedido #{reviewPedidoId}
              </h5>
              <button className="btn-close-custom" onClick={() => setReviewModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body p-4 text-center">
              <div className="mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star} 
                    onClick={() => setReviewStars(star)}
                    style={{ cursor: 'pointer', fontSize: '2.5rem', color: star <= reviewStars ? '#f1c40f' : '#3f3f46', transition: 'color 0.2s', margin: '0 5px' }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea
                className="form-input-custom w-100 mb-4"
                rows={4}
                placeholder="Conte-nos o que achou da pizza! (Opcional)"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
              <button 
                className="btn-primary-custom w-100 py-3" 
                onClick={submitReview}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? 'Enviando...' : 'Enviar Avaliação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

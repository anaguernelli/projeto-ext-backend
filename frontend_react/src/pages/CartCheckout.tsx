import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { ShoppingBag, ArrowLeft, Trash2, MapPin, CreditCard, ChevronRight } from 'lucide-react';

export const CartCheckout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { cartItems, cartTotal, addToCart, removeFromCart, checkout } = useCart();

  const queryParams = new URLSearchParams(location.search);
  const itemName = queryParams.get('item');

  // Customization state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [personalizacao, setPersonalizacao] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [tamanho, setTamanho] = useState('M');
  const [tipoBorda, setTipoBorda] = useState('Tradicional');
  const [ingredientesExtras, setIngredientesExtras] = useState<string[]>([]);
  const [bordasOpcoes, setBordasOpcoes] = useState<any[]>([]);
  const [extrasOpcoes, setExtrasOpcoes] = useState<any[]>([]);

  // Checkout state
  const [endereco, setEndereco] = useState('');
  const [pagamento, setPagamento] = useState('Cartão de Crédito');
  const [isFinishing, setIsFinishing] = useState(false);

  // Coupon state
  const [cupomInput, setCupomInput] = useState('');
  const [cupomAtivo, setCupomAtivo] = useState('');
  const [descontoPercentual, setDescontoPercentual] = useState(0);
  const [cupomErro, setCupomErro] = useState('');
  const [cupomSuccess, setCupomSuccess] = useState('');
  const [isApplyingCupom, setIsApplyingCupom] = useState(false);

  // Fetch product for customization
  useEffect(() => {
    if (itemName) {
      const fetchProduct = async () => {
        try {
          const res = await fetch('/api/produtos');
          const data = await res.json();
          if (data.ok) {
            const found = (data.produtos as Product[]).find(p => p.nome === itemName);
            if (found) {
              setSelectedProduct(found);
            }
          }
        } catch (err) {
          console.error('Erro ao buscar produto para customizar:', err);
        }

        try {
          const res = await fetch('/api/produtos/customizacao');
          const data = await res.json();
          if (data.ok) {
            setBordasOpcoes(data.bordas);
            setExtrasOpcoes(data.ingredientes_extras);
          }
        } catch (err) {
          console.error('Erro ao buscar configuracoes de customizacao', err);
        }
      };
      fetchProduct();
    }
  }, [itemName]);

  // Load user profile to prefill address
  useEffect(() => {
    if (token && !itemName) {
      const loadAddress = async () => {
        try {
          const res = await fetch('/api/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          // The database model might have Address column in user details, though api_me returns basic details, we can check.
          // Fallback to manual entry or empty
        } catch (e) {
          console.log(e);
        }
      };
      loadAddress();
    }
  }, [token, itemName]);

  const handleAddToCartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("Por favor, faça login para adicionar itens ao carrinho.");
      navigate('/login');
      return;
    }
    if (!selectedProduct) return;

    setIsAdding(true);
    const res = await addToCart(selectedProduct.nome, quantidade, personalizacao, tamanho, tipoBorda, ingredientesExtras);
    setIsAdding(false);

    if (res.ok) {
      // Redirect to orders page where cart list is displayed
      navigate('/meus-pedidos');
    } else {
      alert("Erro ao adicionar item: " + res.erro);
    }
  };

  const aplicarCupom = async () => {
    if (!cupomInput.trim()) return;
    setIsApplyingCupom(true);
    setCupomErro('');
    setCupomSuccess('');

    try {
      const res = await fetch('/api/cupom/validar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ codigo: cupomInput })
      });
      const data = await res.json();
      if (data.ok) {
        setCupomAtivo(data.cupom.codigo);
        setDescontoPercentual(data.cupom.percentual_desconto);
        setCupomSuccess(`Cupom aplicado! ${data.cupom.percentual_desconto}% de desconto.`);
      } else {
        setCupomErro(data.erro || 'Cupom inválido.');
        setCupomAtivo('');
        setDescontoPercentual(0);
      }
    } catch (err) {
      setCupomErro('Erro ao validar cupom.');
    } finally {
      setIsApplyingCupom(false);
    }
  };

  const descontoReais = (cartTotal * descontoPercentual) / 100;
  const valorFinal = (cartTotal - descontoReais) + 5.0; // frete fixo de 5.00

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (cartItems.length === 0) return;

    if (!endereco.trim()) {
      alert("Por favor, insira o endereço de entrega.");
      return;
    }

    setIsFinishing(true);
    const res = await checkout(endereco, pagamento, 5.0, valorFinal, cupomAtivo || undefined, descontoReais || undefined);
    setIsFinishing(false);

    if (res.ok) {
      alert("Pedido realizado com sucesso!");
      navigate('/meus-pedidos');
    } else {
      alert("Erro ao finalizar pedido: " + res.erro);
    }
  };

  // 1. CUSTOMIZATION FLOW
  if (itemName) {
    if (!selectedProduct) {
      return (
        <div className="container py-5 text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="text-muted mt-3">Carregando detalhes da pizza...</p>
        </div>
      );
    }

    let precoAtualizado = selectedProduct.preco;
    if (tamanho === 'P') precoAtualizado *= 0.8;
    if (tamanho === 'G') precoAtualizado *= 1.3;

    const bordaSelecionada = bordasOpcoes.find(b => b.nome === tipoBorda);
    if (bordaSelecionada) precoAtualizado += bordaSelecionada.preco_extra;

    ingredientesExtras.forEach(ex => {
      const ingrediente = extrasOpcoes.find(e => e.nome === ex);
      if (ingrediente) precoAtualizado += ingrediente.preco_extra;
    });

    return (
      <div className="container py-5 animate-fade-in text-start">
        <Link to="/cardapio" className="btn-outline-custom mb-4">
          <ArrowLeft size={18} /> Voltar ao Cardápio
        </Link>

        <div className="glass-container p-5">
          <div className="row g-5">
            <div className="col-12 col-md-6 text-center">
              <img 
                src={`/static/image/${selectedProduct.foto}`} 
                alt={selectedProduct.nome} 
                className="img-fluid rounded shadow-lg border border-secondary border-opacity-25" 
                style={{ maxHeight: '350px', objectFit: 'cover', width: '100%' }}
                onError={(e) => { (e.target as any).src = '/static/image/icone.png' }}
              />
            </div>
            <div className="col-12 col-md-6">
              <span className="badge bg-danger bg-opacity-25 text-danger px-3 py-2 rounded-pill fw-semibold mb-2" style={{ border: '1px solid rgba(151,0,0,0.2)' }}>
                {selectedProduct.categoria}
              </span>
              <h1 className="fw-bold text-white mb-2" style={{ fontSize: '2.5rem' }}>{selectedProduct.nome}</h1>
              <p className="text-muted mb-4">{selectedProduct.descricao}</p>
              
              <h3 className="text-warning fw-bold mb-4">
                R$ {precoAtualizado.toFixed(2).replace('.', ',')}
              </h3>

              <form onSubmit={handleAddToCartSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label text-light fw-medium">Tamanho</label>
                    <select 
                      className="form-input-custom form-select bg-dark text-white" 
                      value={tamanho} 
                      onChange={e => setTamanho(e.target.value)}
                    >
                      <option value="P">Pequena (Desconto 20%)</option>
                      <option value="M">Média (Padrão)</option>
                      <option value="G">Grande (Acréscimo 30%)</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label text-light fw-medium">Borda</label>
                    <select 
                      className="form-input-custom form-select bg-dark text-white" 
                      value={tipoBorda} 
                      onChange={e => setTipoBorda(e.target.value)}
                    >
                      {bordasOpcoes.map((b, i) => (
                        <option key={i} value={b.nome}>
                          {b.nome} {b.preco_extra > 0 ? `(+R$ ${b.preco_extra.toFixed(2).replace('.', ',')})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {extrasOpcoes.length > 0 && (
                  <div className="mb-4">
                    <label className="form-label text-light fw-medium">Ingredientes Extras</label>
                    <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {extrasOpcoes.map((ex, i) => (
                        <div key={i} className="form-check mb-2">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={`extra-${i}`} 
                            checked={ingredientesExtras.includes(ex.nome)}
                            onChange={(e) => {
                              if (e.target.checked) setIngredientesExtras([...ingredientesExtras, ex.nome]);
                              else setIngredientesExtras(ingredientesExtras.filter(item => item !== ex.nome));
                            }}
                          />
                          <label className="form-check-label text-muted d-flex justify-content-between" htmlFor={`extra-${i}`}>
                            <span>{ex.nome}</span>
                            <span className="text-warning">+R$ {ex.preco_extra.toFixed(2).replace('.', ',')}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              <div className="mb-3">
                  <label htmlFor="quantidade" className="form-label text-light fw-medium">Quantidade</label>
                  <input 
                    type="number" 
                    id="quantidade" 
                    className="form-input-custom" 
                    min="1" 
                    value={quantidade} 
                    onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)} 
                    required 
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="personalizacao" className="form-label text-light fw-medium">Observações (Opcional)</label>
                  <textarea 
                    id="personalizacao" 
                    className="form-input-custom" 
                    rows={3} 
                    placeholder="Ex: sem cebola, borda com catupiry, bem passada..." 
                    value={personalizacao}
                    onChange={(e) => setPersonalizacao(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-primary-custom w-100 py-3" disabled={isAdding}>
                  {isAdding ? 'Adicionando...' : 'Adicionar ao Carrinho'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. CHECKOUT FLOW (CART)
  return (
    <div className="container py-5 animate-fade-in text-start">
      <div className="mb-4">
        <h1 className="display-6 fw-bold mb-2">Finalizar Pedido</h1>
        <p className="text-muted">Revise suas escolhas e confirme seu endereço de entrega.</p>
      </div>

      {!token ? (
        <div className="glass-container p-5 text-center">
          <ShoppingBag className="text-warning mb-3 mx-auto" size={48} />
          <h4 className="fw-bold text-white mb-3">Autenticação Necessária</h4>
          <p className="text-muted mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>Por favor, realize login ou crie uma conta para visualizar seu carrinho e finalizar seus pedidos.</p>
          <div className="d-flex gap-3 justify-content-center">
            <Link to="/login" className="btn-primary-custom px-4">Login</Link>
            <Link to="/cadastro" className="btn-outline-custom px-4">Cadastro</Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Left Column: Cart Items list */}
          <div className="col-12 col-lg-7">
            <div className="glass-container p-4">
              <h4 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
                <ShoppingBag size={20} className="text-warning" /> Itens no Carrinho
              </h4>

              {cartItems.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p className="mb-3"><ShoppingBag size={48} className="text-secondary" /></p>
                  <p className="mb-3">Seu carrinho está vazio.</p>
                  <Link to="/cardapio" className="btn-primary-custom px-4">Ver Cardápio</Link>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {cartItems.map(item => (
                    <div key={item.id} className="d-flex align-items-center gap-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <img 
                        src={`/static/image/${item.foto}`} 
                        alt={item.nome} 
                        className="rounded border border-secondary border-opacity-25" 
                        style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                        onError={(e) => { (e.target as any).src = '/static/image/icone.png' }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="fw-bold text-white mb-1">{item.nome}</h6>
                        <p className="text-muted small mb-0">
                          Qtd: {item.quantidade} • {item.tamanho === 'P' ? 'Pequena' : item.tamanho === 'G' ? 'Grande' : 'Média'} 
                          {item.tipo_borda !== 'Tradicional' && ` • Borda: ${item.tipo_borda}`}
                        </p>
                        {item.ingredientes_extras && item.ingredientes_extras !== '[]' && (
                          <p className="text-muted small mb-0">
                            Extras: {JSON.parse(item.ingredientes_extras).join(', ')}
                          </p>
                        )}
                        {item.observacao && (
                          <p className="text-muted small mb-0">Obs: {item.observacao}</p>
                        )}
                      </div>
                      <div className="text-end">
                        <span className="text-warning fw-semibold d-block">R$ {item.subtotal.toFixed(2).replace('.', ',')}</span>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="btn btn-sm btn-outline-danger mt-2 border-0"
                          style={{ padding: '4px 8px' }}
                        >
                          <Trash2 size={14} /> Excluir
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between align-items-center pt-3">
                    <Link to="/cardapio" className="btn-outline-custom btn-sm">
                      Adicionar mais itens
                    </Link>
                    <span className="text-muted small">
                      Subtotal: <strong className="text-white">R$ {cartTotal.toFixed(2).replace('.', ',')}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Checkout Summary & Form */}
          <div className="col-12 col-lg-5">
            {cartItems.length > 0 && (
              <div className="d-flex flex-column gap-4">
                {/* Finance Summary */}
                <div className="glass-container p-4">
                  <h5 className="fw-bold text-white mb-4">Resumo da Compra</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal</span>
                    <span className="text-light">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {descontoReais > 0 && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>Desconto ({descontoPercentual}%)</span>
                      <span>- R$ {descontoReais.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Taxa de Entrega</span>
                    <span className="text-light">R$ 5,00</span>
                  </div>
                  <div className="dropdown-divider border-secondary opacity-25 my-3"></div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-white">Total</span>
                    <span className="fw-bold text-warning" style={{ fontSize: '1.4rem' }}>
                      R$ {valorFinal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {/* Cupom Form */}
                <div className="glass-container p-4">
                  <h5 className="fw-bold text-white mb-3">Cupom de Desconto</h5>
                  <div className="d-flex gap-2">
                    <input 
                      type="text" 
                      className="form-input-custom text-uppercase" 
                      placeholder="CÓDIGO" 
                      value={cupomInput}
                      onChange={(e) => setCupomInput(e.target.value.toUpperCase())}
                      disabled={!!cupomAtivo}
                    />
                    <button 
                      type="button" 
                      className={cupomAtivo ? "btn btn-outline-danger" : "btn-outline-custom"} 
                      onClick={cupomAtivo ? () => { setCupomAtivo(''); setDescontoPercentual(0); setCupomInput(''); setCupomSuccess(''); } : aplicarCupom}
                      disabled={isApplyingCupom}
                    >
                      {isApplyingCupom ? '...' : (cupomAtivo ? 'Remover' : 'Aplicar')}
                    </button>
                  </div>
                  {cupomErro && <p className="text-danger small mt-2 mb-0">{cupomErro}</p>}
                  {cupomSuccess && <p className="text-success small mt-2 mb-0">{cupomSuccess}</p>}
                </div>

                {/* Checkout Form */}
                <div className="glass-container p-4">
                  <h5 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
                    <MapPin size={20} className="text-warning" /> Endereço & Pagamento
                  </h5>

                  <form onSubmit={handleCheckoutSubmit}>
                    <div className="mb-3">
                      <label htmlFor="checkout-endereco" className="form-label text-light fw-medium">Endereço de Entrega</label>
                      <input 
                        type="text" 
                        id="checkout-endereco" 
                        className="form-input-custom" 
                        placeholder="Rua, Número, Bairro, Complemento" 
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                        required 
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="checkout-pagamento" className="form-label text-light fw-medium d-flex align-items-center gap-2">
                        <CreditCard size={16} /> Forma de Pagamento
                      </label>
                      <select 
                        id="checkout-pagamento" 
                        className="form-input-custom form-select bg-dark text-white border-secondary"
                        value={pagamento}
                        onChange={(e) => setPagamento(e.target.value)}
                        required
                      >
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Cartão de Débito">Cartão de Débito</option>
                        <option value="PIX">PIX</option>
                        <option value="Dinheiro">Dinheiro</option>
                      </select>
                    </div>

                    <button type="submit" className="btn-primary-custom w-100 py-3" disabled={isFinishing}>
                      {isFinishing ? 'Confirmando...' : 'Confirmar e Finalizar Pedido'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

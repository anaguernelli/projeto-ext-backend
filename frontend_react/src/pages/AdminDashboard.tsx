import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { Settings, Plus, Edit2, Trash2, X, Pizza, Award, Sparkles } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tabs and Metrics
  const [activeTab, setActiveTab] = useState<'produtos' | 'metricas'>('produtos');
  const [metricas, setMetricas] = useState<any>(null);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Salvar Produto');
  const [isEdit, setIsEdit] = useState(false);
  const [formId, setFormId] = useState<number | null>(null);

  // Form fields
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState(0);
  const [categoria, setCategoria] = useState('Populares');
  const [foto, setFoto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAdminProducts = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/produtos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        setProducts(data.produtos || []);
      }
    } catch (err) {
      console.error('Erro ao buscar produtos do admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetricas = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/metricas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        setMetricas(data.metricas);
      } else {
        alert("Erro nas métricas: " + (data.erro || "Desconhecido"));
        setMetricas({ receita_total: 0, total_pedidos: 0, top_produtos: [] });
      }
    } catch (err) {
      console.error('Erro ao buscar metricas:', err);
      setMetricas({ receita_total: 0, total_pedidos: 0, top_produtos: [] });
    }
  };

  useEffect(() => {
    fetchAdminProducts();
    fetchMetricas();
  }, [token]);

  const openAddModal = () => {
    setIsEdit(false);
    setFormId(null);
    setNome('');
    setPreco(39.90);
    setCategoria('Populares');
    setFoto('calabresa.jpeg');
    setDescricao('');
    setTagsText('');
    setAtivo(true);
    setModalTitle('Adicionar Novo Produto');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setIsEdit(true);
    setFormId(p.id || null);
    setNome(p.nome);
    setPreco(p.preco);
    setCategoria(p.categoria);
    setFoto(p.foto);
    setDescricao(p.descricao);
    setTagsText((p.tags || []).join(', '));
    setAtivo(p.ativo);
    setModalTitle(`Editar Produto: ${p.nome}`);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Deseja realmente excluir a pizza "${name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/produtos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        alert(data.mensagem || 'Produto excluído.');
        fetchAdminProducts();
      } else {
        alert('Erro ao excluir: ' + data.erro);
      }
    } catch (err) {
      alert('Erro de conexão ao remover produto.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    const tags = tagsText ? tagsText.split(',').map(t => t.trim()).filter(Boolean) : [];

    const payload: any = {
      preco,
      categoria,
      foto,
      descricao,
      tags,
      ativo
    };

    if (!isEdit) {
      payload.nome = nome.trim();
    }

    const url = isEdit ? `/api/admin/produtos/${formId}` : '/api/admin/produtos';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        setIsModalOpen(false);
        fetchAdminProducts();
        alert(data.mensagem || 'Operação realizada com sucesso!');
      } else {
        alert('Erro ao salvar: ' + data.erro);
      }
    } catch (err) {
      alert('Erro de conexão ao enviar dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-danger fw-bold">Acesso Negado</h3>
        <p className="text-muted">Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  return (
    <>
      <div className="container py-5 animate-fade-in text-start">
      <style>{`
        /* Stepper Modal Override */
        .admin-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
      `}</style>

      {/* Header card */}
      <div className="glass-container p-4 mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div>
          <h1 className="h2 fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <Settings className="text-warning" /> Painel do Administrador
          </h1>
          <p className="text-muted mb-0 small">Gerencie produtos e acompanhe suas vendas.</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className={`btn btn-sm ${activeTab === 'produtos' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary text-light'}`}
            onClick={() => setActiveTab('produtos')}
          >
            Produtos
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'metricas' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary text-light'}`}
            onClick={() => setActiveTab('metricas')}
          >
            Métricas de Vendas
          </button>
        </div>
      </div>

      {activeTab === 'produtos' ? (
        <>
          <div className="d-flex justify-content-end mb-3">
            <button className="btn-primary-custom" onClick={openAddModal}>
              <Plus size={18} /> Novo Produto
            </button>
          </div>
          {/* Catalog Table list */}
      <div className="glass-container p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold text-white mb-0">Catálogo de Pizzas</h5>
          <span className="badge bg-secondary px-3 py-2" style={{ borderRadius: '8px' }}>
            {products.length} Itens
          </span>
        </div>

        {isLoading ? (
          <div className="table-responsive">
            <table className="table align-middle" style={{ color: '#d1d5db', borderColor: 'rgba(255,255,255,0.05)' }}>
              <thead>
                <tr style={{ color: '#71717a', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Status</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td><div className="skeleton-shimmer" style={{ height: '48px', width: '64px', borderRadius: '4px' }} /></td>
                    <td>
                      <div className="skeleton-shimmer mb-2" style={{ height: '16px', width: '120px', borderRadius: '4px' }} />
                      <div className="skeleton-shimmer" style={{ height: '12px', width: '200px', borderRadius: '4px' }} />
                    </td>
                    <td><div className="skeleton-shimmer" style={{ height: '22px', width: '80px', borderRadius: '4px' }} /></td>
                    <td><div className="skeleton-shimmer" style={{ height: '16px', width: '60px', borderRadius: '4px' }} /></td>
                    <td><div className="skeleton-shimmer" style={{ height: '20px', width: '50px', borderRadius: '10px' }} /></td>
                    <td className="text-end"><div className="skeleton-shimmer ms-auto" style={{ height: '28px', width: '80px', borderRadius: '8px' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-5 text-muted">Nenhum item cadastrado no cardápio.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle" style={{ color: '#d1d5db', borderColor: 'rgba(255,255,255,0.05)' }}>
              <thead>
                <tr style={{ color: '#71717a', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Status</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td>
                      <img
                        src={`/static/image/${p.foto}`}
                        alt={p.nome}
                        className="rounded border border-secondary border-opacity-25"
                        style={{ width: '64px', height: '48px', objectFit: 'cover' }}
                        onError={(e) => { (e.target as any).src = '/static/image/icone.png' }}
                      />
                    </td>
                    <td>
                      <strong className="text-light">{p.nome}</strong>
                      <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: '250px' }}>{p.descricao}</p>
                    </td>
                    <td>
                      <span className={`badge px-2 py-1 rounded ${p.categoria === 'Populares' ? 'bg-danger bg-opacity-25 text-danger' :
                          p.categoria === 'Doces' ? 'bg-warning bg-opacity-25 text-warning' :
                            'bg-success bg-opacity-25 text-success'
                        }`} style={{ fontSize: '0.75rem' }}>
                        {p.categoria}
                      </span>
                    </td>
                    <td className="fw-semibold text-warning">
                      R$ {p.preco.toFixed(2).replace('.', ',')}
                    </td>
                    <td>
                      <span className={`badge px-2 py-1 rounded-pill ${p.ativo ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-20 text-muted'}`} style={{ fontSize: '0.7rem' }}>
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button onClick={() => openEditModal(p)} className="btn-outline-custom btn-sm py-1 px-2">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDelete(p.id!, p.nome)} className="btn btn-sm btn-outline-danger border-0">
                          <Trash2 size={12} />
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
        </>
      ) : (
        <div className="glass-container p-4 animate-fade-in">
          <h5 className="fw-bold text-white mb-4">Métricas de Vendas</h5>
          {metricas ? (
            <div>
              <div className="row g-4 mb-5">
                <div className="col-12 col-md-6">
                  <div className="p-4 rounded text-center" style={{ backgroundColor: 'rgba(39, 174, 96, 0.1)', border: '1px solid rgba(39, 174, 96, 0.3)' }}>
                    <h6 className="text-muted mb-2">Receita Total</h6>
                    <h2 className="text-success fw-bold mb-0">R$ {metricas.receita_total.toFixed(2).replace('.', ',')}</h2>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-4 rounded text-center" style={{ backgroundColor: 'rgba(241, 196, 15, 0.1)', border: '1px solid rgba(241, 196, 15, 0.3)' }}>
                    <h6 className="text-muted mb-2">Pedidos Realizados</h6>
                    <h2 className="text-warning fw-bold mb-0">{metricas.total_pedidos}</h2>
                  </div>
                </div>
              </div>

              <h5 className="fw-bold text-white mb-3">Top 5 Pizzas Mais Vendidas</h5>
              <div className="table-responsive">
                <table className="table align-middle" style={{ color: '#d1d5db', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <thead>
                    <tr style={{ color: '#71717a', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                      <th>Posição</th>
                      <th>Produto</th>
                      <th className="text-end">Quantidade Vendida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricas.top_produtos.map((p: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="fw-bold text-warning">#{i + 1}</td>
                        <td className="text-light">{p.nome}</td>
                        <td className="text-end fw-semibold">{p.quantidade} un</td>
                      </tr>
                    ))}
                    {metricas.top_produtos.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center text-muted py-4">Nenhuma venda registrada ainda.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">Carregando métricas...</div>
          )}
        </div>
      )}
      </div>

      {/* 3. ADD/EDIT LIGHT-THEMED DIALOG MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="react-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px', width: '95%' }}>
            <div className="modal-header px-4 py-3" style={{ backgroundColor: '#970000', color: '#fff', borderBottom: 'none', flexShrink: 0 }}>
              <h5 className="modal-title fw-bold">{modalTitle}</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              />
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body p-4" style={{ overflowY: 'auto' }}>

                <div className="mb-3">
                  <label htmlFor="modal-nome" className="form-label text-light fw-medium">Nome da Pizza</label>
                  <input
                    type="text"
                    id="modal-nome"
                    className="form-input-custom"
                    placeholder="Ex: Quatro Queijos"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={isEdit}
                    required
                  />
                  {isEdit && (
                    <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>
                      O nome não pode ser alterado após a criação (regra do banco).
                    </div>
                  )}
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label htmlFor="modal-preco" className="form-label text-light fw-medium">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      id="modal-preco"
                      className="form-input-custom"
                      placeholder="39.90"
                      value={preco}
                      onChange={(e) => setPreco(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label htmlFor="modal-categoria" className="form-label text-light fw-medium">Categoria</label>
                    <select
                      id="modal-categoria"
                      className="form-input-custom"
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      style={{ background: '#121214', color: '#fff' }}
                      required
                    >
                      <option value="Populares" style={{ background: '#121214', color: '#fff' }}>Populares</option>
                      <option value="Doces" style={{ background: '#121214', color: '#fff' }}>Doces</option>
                      <option value="Especiais" style={{ background: '#121214', color: '#fff' }}>Especiais</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="modal-foto" className="form-label text-light fw-medium">Arquivo de Imagem</label>
                  <input
                    type="text"
                    id="modal-foto"
                    className="form-input-custom"
                    placeholder="Ex: calabresa.jpeg"
                    value={foto}
                    onChange={(e) => setFoto(e.target.value)}
                    required
                  />
                  <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                    Nome do arquivo copiado (ex: 4queijos.jpg, calabresa.jpeg, brigadeiro.jpg, mussarela.jpeg).
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="modal-descricao" className="form-label text-light fw-medium">Descrição / Ingredientes</label>
                  <textarea
                    id="modal-descricao"
                    className="form-input-custom"
                    rows={3}
                    placeholder="Ingredientes que compõem a pizza..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="modal-tags" className="form-label text-light fw-medium">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    id="modal-tags"
                    className="form-input-custom"
                    placeholder="borda-recheada, queijo-duplo"
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                  />
                </div>

                <div className="form-check form-switch mt-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="modal-ativo"
                    checked={ativo}
                    onChange={(e) => setAtivo(e.target.checked)}
                  />
                  <label className="form-check-label ms-2 fw-medium text-light" htmlFor="modal-ativo">
                    Produto Ativo (exibir no cardápio público)
                  </label>
                </div>

              </div>

              <div className="modal-footer px-4 py-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', flexShrink: 0 }}>
                <button type="button" className="btn-outline-custom" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary-custom" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Pizza, Home, Info, ShoppingCart, User, LogOut, Settings, Menu, X, Receipt } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <header className="w-100 position-fixed top-0 start-0" style={{ zIndex: 1000 }}>
      {/* Dynamic CSS override for navbar styling */}
      <style>{`
        .custom-navbar {
          background-color: rgba(18, 18, 20, 0.8) !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 16px 8%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .logo-link {
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: transform 0.2s ease;
        }
        .logo-link:hover {
          transform: scale(1.02);
          color: #fff;
        }
        .nav-list {
          list-style: none;
          display: flex;
          align-items: center;
          gap: 24px;
          margin: 0;
          padding: 0;
        }
        .nav-link-item {
          color: #9ca3af;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .nav-link-item:hover, .nav-link-item.active {
          color: #F4D03F;
          background: rgba(244, 208, 99, 0.08);
        }
        .peca-btn {
          background-color: #F4D03F;
          color: #000;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 10px;
          transition: all 0.2s ease;
        }
        .peca-btn:hover {
          background-color: #e5c128;
          color: #000;
        }
        .auth-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .login-btn {
          color: #fff;
          font-weight: 500;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          padding: 8px 16px;
          border-radius: 8px;
        }
        .login-btn:hover {
          background: rgba(255,255,255,0.05);
        }
        .user-menu-container {
          position: relative;
        }
        .user-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: #fff;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .user-btn:hover {
          background: rgba(244, 208, 99, 0.1);
          border-color: #F4D03F;
        }
        .user-dropdown {
          position: absolute;
          top: 52px;
          right: 0;
          background: #18181b;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          width: 200px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .user-dropdown-header {
          padding: 8px 12px;
          font-size: 0.85rem;
          color: #9ca3af;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 6px;
        }
        .user-dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.95rem;
          color: #d1d5db;
          transition: all 0.2s;
        }
        .user-dropdown-item:hover {
          background: rgba(255, 255, 255, 0.04);
          color: #fff;
        }
        .user-dropdown-item.text-danger:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
        }
        .hamburger-btn {
          display: none;
          color: #fff;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .mobile-nav-menu {
          display: none;
          position: fixed;
          top: 76px;
          left: 0;
          right: 0;
          background: #121214;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 24px;
          flex-direction: column;
          gap: 16px;
          z-index: 999;
        }
        @media (max-width: 1024px) {
          .nav-list, .peca-btn, .auth-actions-desktop {
            display: none;
          }
          .hamburger-btn {
            display: block;
          }
          .mobile-nav-menu.open {
            display: flex;
          }
        }
      `}</style>

      <div className="custom-navbar">
        <Link to="/" className="logo-link">
          <Pizza className="text-warning animate-pulse" size={32} />
          <span>Pizzaria 404</span>
        </Link>

        {/* Desktop Menu */}
        <ul className="nav-list">
          <li>
            <Link to="/" className={`nav-link-item ${isActive('/')}`}>
              <Home size={18} /> Início
            </Link>
          </li>
          <li>
            <Link to="/cardapio" className={`nav-link-item ${isActive('/cardapio')}`}>
              <Pizza size={18} /> Cardápio
            </Link>
          </li>
          <li>
            <Link to="/sobre" className={`nav-link-item ${isActive('/sobre')}`}>
              <Info size={18} /> Sobre Nós
            </Link>
          </li>
        </ul>

        <div className="auth-actions auth-actions-desktop">
          <Link to="/cardapio" className="peca-btn me-3">
            Peça aqui
          </Link>

          {!user ? (
            <>
              <Link to="/login" className="login-btn me-2">Login</Link>
              <Link to="/cadastro" className="btn-primary-custom py-2 px-3">Cadastro</Link>
            </>
          ) : (
            <>
              {/* Cart link */}
              <Link to="/meus-pedidos" className="nav-link-item position-relative me-2">
                <ShoppingCart size={22} className="text-light" />
                {totalCartCount > 0 && (
                  <span key={totalCartCount} className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-pop" style={{ fontSize: '0.7rem' }}>
                    {totalCartCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div className="user-menu-container">
                <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <User size={20} />
                </button>
                {dropdownOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">Olá, {user.nome}!</div>

                    {user.role === 'admin' && (
                      <Link to="/admin" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <Settings size={16} /> Painel Admin
                      </Link>
                    )}

                    <Link to="/meus-pedidos" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <Receipt size={16} /> Meus Pedidos
                    </Link>

                    <div className="dropdown-divider border-secondary opacity-25"></div>

                    <button className="user-dropdown-item text-danger bg-transparent border-0 text-start w-100" onClick={handleLogout}>
                      <LogOut size={16} /> Sair
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile navigation drawer */}
      <div className={`mobile-nav-menu ${isOpen ? 'open' : ''}`}>
        <Link to="/" className={`nav-link-item ${isActive('/')}`} onClick={() => setIsOpen(false)}>
          <Home size={18} /> Início
        </Link>
        <Link to="/cardapio" className={`nav-link-item ${isActive('/cardapio')}`} onClick={() => setIsOpen(false)}>
          <Pizza size={18} /> Cardápio
        </Link>
        <Link to="/sobre" className={`nav-link-item ${isActive('/sobre')}`} onClick={() => setIsOpen(false)}>
          <Info size={18} /> Sobre Nós
        </Link>
        <div className="dropdown-divider border-secondary opacity-25"></div>
        {user ? (
          <>
            <Link to="/meus-pedidos" className="nav-link-item" onClick={() => setIsOpen(false)}>
              <ShoppingCart size={18} /> Carrinho / Pedidos ({totalCartCount})
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="nav-link-item text-warning" onClick={() => setIsOpen(false)}>
                <Settings size={18} /> Painel Admin
              </Link>
            )}
            <button className="nav-link-item text-danger bg-transparent border-0 text-start w-100" onClick={handleLogout}>
              <LogOut size={18} /> Sair ({user.nome})
            </button>
          </>
        ) : (
          <div className="d-flex flex-column gap-2 mt-2">
            <Link to="/login" className="login-btn text-center" onClick={() => setIsOpen(false)}>Login</Link>
            <Link to="/cadastro" className="btn-primary-custom text-center py-2" onClick={() => setIsOpen(false)}>Cadastro</Link>
          </div>
        )}
      </div>
    </header>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface CartItem {
  id: number;
  nome: string;
  foto: string;
  valor_unitario: number;
  quantidade: number;
  observacao: string;
  subtotal: number;
  tamanho?: string;
  tipo_borda?: string;
  ingredientes_extras?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartTotal: number;
  isCartLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (item: string, quantidade: number, personalizacao: string, tamanho?: string, tipoBorda?: string, ingredientesExtras?: string[]) => Promise<{ ok: boolean; erro?: string }>;
  removeFromCart: (itemId: number) => Promise<{ ok: boolean; erro?: string }>;
  checkout: (endereco: string, pagamento: string, frete: number, total: number, cupomCodigo?: string, descontoAplicado?: number) => Promise<{ ok: boolean; erro?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isCartLoading, setIsCartLoading] = useState(false);

  const fetchCart = async () => {
    if (!token) {
      setCartItems([]);
      setCartTotal(0);
      return;
    }

    setIsCartLoading(true);
    try {
      const res = await fetch('/api/carrinho', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        setCartItems(data.itens || []);
        setCartTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Erro ao buscar carrinho:', err);
    } finally {
      setIsCartLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token, user]);

  const addToCart = async (item: string, quantidade: number, personalizacao: string, tamanho = "M", tipoBorda = "Tradicional", ingredientesExtras: string[] = []) => {
    if (!token) return { ok: false, erro: 'Faça login para adicionar itens ao carrinho.' };

    try {
      const res = await fetch('/api/pedido', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ item, quantidade, personalizacao, tamanho, tipo_borda: tipoBorda, ingredientes_extras: ingredientesExtras })
      });
      const data = await res.json();
      if (res.status === 201 || data.ok) {
        await fetchCart();
        return { ok: true };
      } else {
        return { ok: false, erro: data.erro || 'Falha ao adicionar item.' };
      }
    } catch (err) {
      return { ok: false, erro: 'Erro de conexão.' };
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!token) return { ok: false, erro: 'Faça login.' };

    try {
      const res = await fetch(`/api/pedido_item/delete/${itemId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        await fetchCart();
        return { ok: true };
      } else {
        return { ok: false, erro: data.erro || 'Falha ao remover item.' };
      }
    } catch (err) {
      return { ok: false, erro: 'Erro de conexão.' };
    }
  };

  const checkout = async (endereco_entrega: string, forma_pagamento: string, valor_frete: number, total_pago: number, cupom_codigo?: string, desconto_aplicado?: number) => {
    if (!token) return { ok: false, erro: 'Faça login.' };

    try {
      const res = await fetch('/api/pedido/finalizar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          endereco_entrega,
          forma_pagamento,
          valor_frete,
          total_pago,
          cupom_codigo,
          desconto_aplicado
        })
      });
      const data = await res.json();
      if (data.ok) {
        setCartItems([]);
        setCartTotal(0);
        return { ok: true };
      } else {
        return { ok: false, erro: data.erro || 'Falha ao finalizar pedido.' };
      }
    } catch (err) {
      return { ok: false, erro: 'Erro de conexão.' };
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, cartTotal, isCartLoading, fetchCart, addToCart, removeFromCart, checkout }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};

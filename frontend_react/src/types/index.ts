export interface User {
  nome: string;
  email: string;
  role: 'admin' | 'user';
  metodo?: string;
}

export interface Product {
  id?: number;
  nome: string;
  preco: number;
  foto: string;
  descricao: string;
  categoria: string;
  tags?: string[];
  ativo: boolean;
}

export interface CartItem {
  produto: Product;
  quantidade: number;
  observacao: string;
  tamanho?: string;
  tipo_borda?: string;
  ingredientes_extras?: string;
}

export interface OrderItem {
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

export interface Order {
  pedido_id: number;
  status: 'RECEBIDO' | 'PREPARANDO' | 'EM_ROTA_DE_ENTREGA' | 'ENTREGUE';
  data: string;
  endereco_entrega: string;
  forma_pagamento: string;
  valor_frete: number;
  total_pago: number;
  itens?: OrderItem[];
}

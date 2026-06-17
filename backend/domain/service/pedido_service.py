from typing import List
from backend.domain.entity.pedido import Pedido
from backend.domain.entity.pedido_item import PedidoItem
from backend.domain.entity.produto import Produto
from backend.domain.dto.pedido_dto import AdicionarItemDTO
from backend.domain.repository.pedido_repository import PedidoRepository
from backend.domain.repository.usuario_repository import UsuarioRepository
from backend.domain.repository.produto_repository import ProdutoRepository

class PedidoService:
    def __init__(self, pedido_repo: PedidoRepository, usuario_repo: UsuarioRepository, produto_repo: ProdutoRepository):
        self.pedido_repo = pedido_repo
        self.usuario_repo = usuario_repo
        self.produto_repo = produto_repo

    def get_menu(self) -> List[Produto]:
        """Retrieves all products in the menu from the database"""
        return self.produto_repo.get_all()

    def get_product_by_name(self, nome: str) -> Produto:
        """Finds a product in the menu by name"""
        return self.produto_repo.get_by_name(nome)

    def add_item(self, user_name: str, dto: AdicionarItemDTO) -> None:
        """Adds an item to the cart/open order using authenticated DB data"""
        usuario = self.usuario_repo.get_by_name(user_name)
        if not usuario:
            raise ValueError("Usuário não encontrado.")

        # Securely fetch product data from the database
        produto = self.produto_repo.get_by_name(dto.item_nome)
        if not produto:
            raise ValueError(f"O item '{dto.item_nome}' não está no nosso cardápio oficial.")

        # Busca ou cria o pedido aberto
        pedido = self.pedido_repo.get_open_pedido(usuario.id)
        if not pedido:
            new_pedido = Pedido(usuario_id=usuario.id)
            pedido_id = self.pedido_repo.save_pedido(new_pedido)
        else:
            pedido_id = pedido.id

        # Calcular preço baseando no tamanho
        preco_base = float(produto.preco)
        if dto.tamanho == 'P':
            preco_base *= 0.8
        elif dto.tamanho == 'G':
            preco_base *= 1.3

        # Calcular preço da borda
        bordas = self.produto_repo.get_bordas()
        borda_extra = next((b['preco_extra'] for b in bordas if b['nome'] == dto.tipo_borda), 0.0)

        # Calcular ingredientes extras
        import json
        extras_db = self.produto_repo.get_ingredientes_extras()
        extras_total = 0.0
        try:
            extras_list = dto.ingredientes_extras if isinstance(dto.ingredientes_extras, list) else json.loads(dto.ingredientes_extras)
            for ex in extras_list:
                extras_total += next((e['preco_extra'] for e in extras_db if e['nome'] == ex), 0.0)
        except Exception:
            pass

        preco_final = preco_base + borda_extra + extras_total

        # Adiciona item ao pedido utilizando o valor recalculado
        item = PedidoItem(
            pedido_id=pedido_id,
            item_nome=produto.nome,
            item_foto=produto.foto,
            item_valor=preco_final,
            quantidade=dto.quantidade,
            observacao=dto.observacao,
            tamanho=dto.tamanho,
            tipo_borda=dto.tipo_borda,
            ingredientes_extras=json.dumps(dto.ingredientes_extras) if isinstance(dto.ingredientes_extras, list) else dto.ingredientes_extras
        )
        self.pedido_repo.save_item(item)

    def get_cart_items(self, user_name: str) -> List[PedidoItem]:
        """Retrieves all items in the user's cart"""
        usuario = self.usuario_repo.get_by_name(user_name)
        if not usuario:
            return []
        return self.pedido_repo.get_open_pedido_items(usuario.id)

    def remove_cart_item(self, user_name: str, pedido_item_id: int) -> None:
        """Removes an item from the user's cart"""
        usuario = self.usuario_repo.get_by_name(user_name)
        if not usuario:
            raise ValueError("Usuário não encontrado.")
        self.pedido_repo.delete_item_from_open_pedido(pedido_item_id, usuario.id)

    def checkout_cart(self, user_name: str, dto) -> None:
        """Finalizes the user's cart using frozen checkout data.
        Receives a DTO containing address, payment method, shipping cost, and total paid.
        """
        usuario = self.usuario_repo.get_by_name(user_name)
        if not usuario:
            raise ValueError("Usuário não encontrado.")
        # Business validation
        if hasattr(dto, 'validate'):
            dto.validate()
        else:
            raise ValueError('DTO de checkout inválido.')
        # Persiste os dados congelados no pedido
        self.pedido_repo.finalize_open_pedido(
            usuario.id,
            endereco_entrega=dto.endereco_entrega,
            forma_pagamento=dto.forma_pagamento,
            valor_frete=dto.valor_frete,
            total_pago=dto.total_pago,
            cupom_codigo=dto.cupom_codigo,
            desconto_aplicado=dto.desconto_aplicado
        )

    def validate_coupon(self, codigo: str) -> dict:
        """Valida um cupom de desconto pelo código e retorna suas informações."""
        cupom = self.pedido_repo.get_cupom(codigo)
        if not cupom:
            raise ValueError("Cupom inválido ou expirado.")
        return cupom

    def get_history(self, user_name: str) -> List[dict]:
        """Returns the user's finalized order history, including items for each order"""
        usuario = self.usuario_repo.get_by_name(user_name)
        if not usuario:
            return []
        from datetime import datetime, timezone

        pedidos = self.pedido_repo.get_finalized_pedidos(usuario.id)
        historico = []
        for pedido in pedidos:
            # Simulador de progresso do pedido
            if pedido.status != 'ENTREGUE' and pedido.criado_em:
                try:
                    dt_criado = datetime.strptime(pedido.criado_em, "%Y-%m-%d %H:%M:%S")
                    dt_agora = datetime.utcnow()
                    delta_segundos = (dt_agora - dt_criado).total_seconds()
                    
                    novo_status = pedido.status
                    if delta_segundos > 60:
                        novo_status = 'ENTREGUE'
                    elif delta_segundos > 30:
                        novo_status = 'EM_ROTA_DE_ENTREGA'
                    elif delta_segundos > 10:
                        novo_status = 'PREPARANDO'

                    if novo_status != pedido.status:
                        self.pedido_repo.update_pedido_status(pedido.id, novo_status)
                        pedido.status = novo_status
                except Exception:
                    pass

            itens = self.pedido_repo.get_pedido_items(pedido.id)
            historico.append({
                "pedido_id": pedido.id,
                "data": pedido.criado_em,
                "status": pedido.status,
                "total_pago": float(pedido.total_pago or 0.0),
                "valor_frete": float(pedido.valor_frete or 0.0),
                "endereco_entrega": pedido.endereco_entrega,
                "forma_pagamento": pedido.forma_pagamento,
                "itens": [
                    {
                        "id": it.id,
                        "nome": it.item_nome,
                        "foto": it.item_foto,
                        "valor_unitario": float(it.item_valor),
                        "quantidade": int(it.quantidade),
                        "observacao": it.observacao,
                        "subtotal": float(it.subtotal),
                        "tamanho": it.tamanho,
                        "tipo_borda": it.tipo_borda,
                        "ingredientes_extras": it.ingredientes_extras
                    }
                    for it in itens
                ]
            })
        return historico

    def avaliar_pedido(self, user_name: str, pedido_id: int, estrelas: int, comentario: str) -> None:
        if estrelas < 1 or estrelas > 5:
            raise ValueError("Avaliação deve ser entre 1 e 5 estrelas.")
        
        # Opcional: verificar se o pedido pertence ao usuario e está entregue
        
        if self.pedido_repo.has_avaliacao(pedido_id):
            raise ValueError("Este pedido já foi avaliado.")
            
        self.pedido_repo.save_avaliacao(pedido_id, user_name, estrelas, comentario)

    def get_avaliacoes(self) -> List[dict]:
        return self.pedido_repo.get_avaliacoes()

    def get_metricas_vendas(self) -> dict:
        return self.pedido_repo.get_metricas_vendas()


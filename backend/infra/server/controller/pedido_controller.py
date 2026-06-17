from flask import request, jsonify, g
from backend.domain.dto.pedido_dto import AdicionarItemDTO
from backend.domain.dto.finalizar_pedido_dto import FinalizarPedidoDTO
from backend.domain.service.pedido_service import PedidoService

class PedidoController:
    def __init__(self, pedido_service: PedidoService):
        self.pedido_service = pedido_service

    def obter_carrinho(self):
        """Retorna todos os itens do carrinho ativo do usuário em formato JSON estruturado"""
        nome = g.current_user.nome
        try:
            itens = self.pedido_service.get_cart_items(nome)
            total = 0.0
            itens_out = []
            for it in itens:
                total += it.subtotal
                itens_out.append({
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
                })
            return jsonify({
                "ok": True,
                "itens": itens_out,
                "total": float(total)
            })
        except Exception as e:
            return jsonify({"ok": False, "erro": f"Erro ao buscar carrinho: {str(e)}"}), 500

    def adicionar_item(self):
        """Adiciona um item ao carrinho via form-data ou JSON payload"""
        nome = g.current_user.nome
        
        # Suporta tanto form-data tradicional quanto payloads JSON
        dados = request.get_json(silent=True) or {}
        item = request.form.get("item")
        if not item:
            item = dados.get("item")
        item = (item or "").strip()

        personalizacao = request.form.get("personalizacao")
        if not personalizacao:
            personalizacao = dados.get("personalizacao")
        personalizacao = (personalizacao or "").strip()

        quantidade = request.form.get("quantidade")
        if not quantidade:
            quantidade = dados.get("quantidade")
        quantidade = str(quantidade or "1").strip()

        tamanho = request.form.get("tamanho") or dados.get("tamanho") or "M"
        tipo_borda = request.form.get("tipo_borda") or dados.get("tipo_borda") or "Tradicional"
        ingredientes_extras = request.form.get("ingredientes_extras") or dados.get("ingredientes_extras") or []

        dto = AdicionarItemDTO(
            item_nome=item,
            quantidade=quantidade,
            observacao=personalizacao,
            tamanho=tamanho,
            tipo_borda=tipo_borda,
            ingredientes_extras=ingredientes_extras
        )
        try:
            dto.validate()  # Valida contrato sintático (Single Source of Truth)
            self.pedido_service.add_item(nome, dto)
            return jsonify({
                "ok": True,
                "mensagem": f"Item '{dto.item_nome}' adicionado ao carrinho com sucesso!"
            }), 201
        except ValueError as e:
            return jsonify({"ok": False, "erro": str(e)}), 400
        except Exception as e:
            return jsonify({"ok": False, "erro": f"Erro interno do servidor: {str(e)}"}), 500

    def remover_item(self, pedido_item_id):
        """Remove um item específico do carrinho"""
        nome = g.current_user.nome
        try:
            self.pedido_service.remove_cart_item(nome, pedido_item_id)
            return jsonify({
                "ok": True,
                "mensagem": "Item removido do carrinho com sucesso!"
            })
        except ValueError as e:
            return jsonify({"ok": False, "erro": str(e)}), 400
        except Exception as e:
            return jsonify({"ok": False, "erro": f"Erro ao remover item: {str(e)}"}), 500

    def finalizar(self):
        """Finaliza o carrinho ativo (Checkout) usando dados de checkout congelados."""
        nome = g.current_user.nome
        try:
            data = request.get_json(silent=True) or {}
            # Expected fields: endereco_entrega, forma_pagamento, valor_frete, total_pago
            dto = FinalizarPedidoDTO(
                endereco_entrega=data.get('endereco_entrega'),
                forma_pagamento=data.get('forma_pagamento'),
                valor_frete=data.get('valor_frete'),
                total_pago=data.get('total_pago'),
                cupom_codigo=data.get('cupom_codigo'),
                desconto_aplicado=data.get('desconto_aplicado', 0.0)
            )
            # Service now expects DTO
            self.pedido_service.checkout_cart(nome, dto)
            return jsonify({
                "ok": True,
                "mensagem": "Pedido finalizado com sucesso!"
            })
        except ValueError as e:
            return jsonify({"ok": False, "erro": str(e)}), 400
        except Exception as e:
            return jsonify({"ok": False, "erro": f"Erro ao finalizar pedido: {str(e)}"}), 500

    def obter_historico(self):
        """Retorna o histórico de pedidos finalizados do usuário em JSON"""
        nome = g.current_user.nome
        try:
            historico = self.pedido_service.get_history(nome)
            return jsonify({
                "ok": True,
                "historico": historico
            })
        except Exception as e:
            return jsonify({"ok": False, "erro": f"Erro ao buscar histórico: {str(e)}"}), 500

    def validar_cupom(self):
        """Valida um código de cupom enviado pelo front e retorna seu desconto"""
        try:
            data = request.get_json(silent=True) or {}
            codigo = (data.get("codigo") or "").strip().upper()
            if not codigo:
                return jsonify({"ok": False, "erro": "Código de cupom não informado."}), 400
            
            cupom = self.pedido_service.validate_coupon(codigo)
            return jsonify({
                "ok": True,
                "cupom": cupom
            })
        except ValueError as e:
            return jsonify({"ok": False, "erro": str(e)}), 400
        except Exception as e:
            return jsonify({"ok": False, "erro": f"Erro interno: {str(e)}"}), 500

    def avaliar(self):
        nome = g.current_user.nome
        data = request.get_json(silent=True) or {}
        pedido_id = data.get("pedido_id")
        estrelas = data.get("estrelas")
        comentario = data.get("comentario", "")

        try:
            self.pedido_service.avaliar_pedido(nome, int(pedido_id), int(estrelas), comentario)
            return jsonify({"ok": True})
        except Exception as e:
            return jsonify({"ok": False, "erro": str(e)}), 400

    def obter_avaliacoes(self):
        try:
            avaliacoes = self.pedido_service.get_avaliacoes()
            return jsonify({"ok": True, "avaliacoes": avaliacoes})
        except Exception as e:
            return jsonify({"ok": False, "erro": str(e)}), 500

    def obter_metricas_vendas(self):
        try:
            metricas = self.pedido_service.get_metricas_vendas()
            return jsonify({"ok": True, "metricas": metricas})
        except Exception as e:
            return jsonify({"ok": False, "erro": str(e)}), 500

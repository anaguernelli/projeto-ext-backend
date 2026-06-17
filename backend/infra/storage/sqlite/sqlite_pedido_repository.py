from typing import List
from backend.domain.repository.pedido_repository import PedidoRepository
from backend.domain.entity.pedido import Pedido
from backend.domain.entity.pedido_item import PedidoItem
from backend.infra.storage.sqlite.model.sqlite_pedido_model import SqlitePedidoModel, SqlitePedidoItemModel
from backend.infra.db import get_db

class SqlitePedidoRepository(PedidoRepository):
    def get_open_pedido(self, usuario_id: int) -> Pedido:
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM Pedidos WHERE UsuarioId = ? AND Status = 'ABERTO' ORDER BY Id DESC LIMIT 1",
                (usuario_id,),
            ).fetchone()
            return SqlitePedidoModel.to_entity(row)

    def save_pedido(self, pedido: Pedido) -> int:
        with get_db() as conn:
            cur = conn.execute(
                "INSERT INTO Pedidos (UsuarioId, Status) VALUES (?, 'ABERTO')",
                (pedido.usuario_id,),
            )
            conn.commit()
            return cur.lastrowid

    def get_pedido_by_id(self, pedido_id: int) -> Pedido:
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM Pedidos WHERE Id = ?",
                (pedido_id,)
            ).fetchone()
            return SqlitePedidoModel.to_entity(row) if row else None

    def list_active_orders(self) -> List[Pedido]:
        """Return orders whose status is not final (ENTREGUE)."""
        with get_db() as conn:
            rows = conn.execute(
                "SELECT * FROM Pedidos WHERE Status != 'ENTREGUE'"
            ).fetchall()
            return [SqlitePedidoModel.to_entity(r) for r in rows]

    def advance_status(self, pedido_id: int) -> None:
        """Advance the status of the given order to the next step in the sequence."""
        with get_db() as conn:
            # Get current status
            cur = conn.execute(
                "SELECT Status FROM Pedidos WHERE Id = ?",
                (pedido_id,)
            ).fetchone()
            if not cur:
                return
            current_status = cur["Status"]
            # Compute next status using the domain sequence
            from backend.domain.entity.pedido import Pedido as PedidoEntity
            next_status = PedidoEntity.STATUS_SEQUENCE[PedidoEntity.STATUS_SEQUENCE.index(current_status) + 1] \
                if current_status in PedidoEntity.STATUS_SEQUENCE and \
                   PedidoEntity.STATUS_SEQUENCE.index(current_status) + 1 < len(PedidoEntity.STATUS_SEQUENCE) \
                else None
            if next_status:
                conn.execute(
                    "UPDATE Pedidos SET Status = ? WHERE Id = ?",
                    (next_status, pedido_id)
                )
                conn.commit()

    def save_item(self, item: PedidoItem) -> None:
        with get_db() as conn:
            conn.execute(
                """
                    INSERT INTO PedidoItens (PedidoId, ItemNome, ItemFoto, ItemValor, Quantidade, Observacao, Tamanho, TipoBorda, IngredientesExtras)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (item.pedido_id, item.item_nome, item.item_foto, float(item.item_valor), int(item.quantidade), item.observacao, item.tamanho, item.tipo_borda, item.ingredientes_extras),
            )
            conn.commit()

    def get_open_pedido_items(self, usuario_id: int) -> List[PedidoItem]:
        with get_db() as conn:
            rows = conn.execute(
                """
                SELECT pi.Id,
                       pi.PedidoId,
                       pi.ItemNome,
                       pi.ItemFoto,
                       pi.ItemValor,
                       pi.Quantidade,
                       pi.Observacao,
                       pi.Tamanho,
                       pi.TipoBorda,
                       pi.IngredientesExtras,
                       pi.CriadoEm
                FROM PedidoItens pi
                JOIN Pedidos p ON p.Id = pi.PedidoId
                WHERE p.UsuarioId = ? AND p.Status = 'ABERTO'
                ORDER BY pi.Id DESC
                """,
                (usuario_id,),
            ).fetchall()
            return [SqlitePedidoItemModel.to_entity(r) for r in rows]

    def delete_item_from_open_pedido(self, pedido_item_id: int, usuario_id: int) -> None:
        with get_db() as conn:
            conn.execute(
                """
                DELETE FROM PedidoItens
                WHERE Id = ?
                  AND PedidoId IN (
                    SELECT Id FROM Pedidos
                    WHERE UsuarioId = ? AND Status = 'ABERTO'
                  )
                """,
                (pedido_item_id, usuario_id),
            )
            conn.commit()

    def finalize_open_pedido(self, usuario_id: int, endereco_entrega: str = None, forma_pagamento: str = None, valor_frete: float = None, total_pago: float = None, cupom_codigo: str = None, desconto_aplicado: float = None) -> None:
        with get_db() as conn:
            conn.execute(
                """
                UPDATE Pedidos
                SET Status = 'RECEBIDO',
                    EnderecoEntrega = ?,
                    FormaPagamento = ?,
                    ValorFrete = ?,
                    TotalPago = ?,
                    CupomCodigo = ?,
                    DescontoAplicado = ?
                WHERE UsuarioId = ? AND Status = 'ABERTO'
                """,
                (endereco_entrega, forma_pagamento, valor_frete, total_pago, cupom_codigo, desconto_aplicado, usuario_id),
            )
            conn.commit()

    def get_finalized_pedidos(self, usuario_id: int) -> List[Pedido]:
        with get_db() as conn:
            rows = conn.execute(
                "SELECT * FROM Pedidos WHERE UsuarioId = ? AND Status != 'ABERTO' ORDER BY Id DESC",
                (usuario_id,)
            ).fetchall()
            return [SqlitePedidoModel.to_entity(r) for r in rows]

    def update_pedido_status(self, pedido_id: int, status: str) -> None:
        with get_db() as conn:
            conn.execute("UPDATE Pedidos SET Status = ? WHERE Id = ?", (status, pedido_id))
            conn.commit()

    def get_pedido_items(self, pedido_id: int) -> List[PedidoItem]:
        with get_db() as conn:
            rows = conn.execute(
                """
                SELECT pi.Id,
                       pi.PedidoId,
                       pi.ItemNome,
                       pi.ItemFoto,
                       pi.ItemValor,
                       pi.Quantidade,
                       pi.Observacao,
                       pi.Tamanho,
                       pi.TipoBorda,
                       pi.IngredientesExtras,
                       pi.CriadoEm
                FROM PedidoItens pi
                WHERE pi.PedidoId = ?
                ORDER BY pi.Id DESC
                """,
                (pedido_id,)
            ).fetchall()
            return [SqlitePedidoItemModel.to_entity(r) for r in rows]

    def get_cupom(self, codigo: str) -> dict:
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM Cupons WHERE Codigo = ? AND Ativo = 1",
                (codigo,)
            ).fetchone()
            if row:
                return {
                    "id": row["Id"],
                    "codigo": row["Codigo"],
                    "percentual_desconto": float(row["PercentualDesconto"])
                }
            return None

    def save_avaliacao(self, pedido_id: int, usuario_nome: str, estrelas: int, comentario: str) -> None:
        with get_db() as conn:
            conn.execute(
                """
                INSERT INTO Avaliacoes (PedidoId, UsuarioNome, Estrelas, Comentario)
                VALUES (?, ?, ?, ?)
                """,
                (pedido_id, usuario_nome, estrelas, comentario)
            )
            conn.commit()

    def get_avaliacoes(self) -> List[dict]:
        with get_db() as conn:
            rows = conn.execute("SELECT * FROM Avaliacoes ORDER BY Id DESC LIMIT 10").fetchall()
            return [{
                "id": r["Id"],
                "pedido_id": r["PedidoId"],
                "usuario_nome": r["UsuarioNome"],
                "estrelas": r["Estrelas"],
                "comentario": r["Comentario"]
            } for r in rows]

    def has_avaliacao(self, pedido_id: int) -> bool:
        with get_db() as conn:
            row = conn.execute("SELECT 1 FROM Avaliacoes WHERE PedidoId = ?", (pedido_id,)).fetchone()
            return bool(row)

    def get_metricas_vendas(self) -> dict:
        with get_db() as conn:
            # Total revenue
            row_total = conn.execute("SELECT SUM(TotalPago) as receita, COUNT(*) as qtd FROM Pedidos WHERE Status != 'ABERTO'").fetchone()
            receita = float(row_total["receita"] or 0)
            qtd_pedidos = int(row_total["qtd"] or 0)

            # Best selling
            rows_top = conn.execute("""
                SELECT pi.ItemNome as Nome, SUM(pi.Quantidade) as total_vendido
                FROM PedidoItens pi
                JOIN Pedidos ped ON pi.PedidoId = ped.Id
                WHERE ped.Status != 'ABERTO'
                GROUP BY pi.ItemNome
                ORDER BY total_vendido DESC
                LIMIT 5
            """).fetchall()

            top_produtos = [{"nome": r["Nome"], "quantidade": int(r["total_vendido"])} for r in rows_top]

            return {
                "receita_total": receita,
                "total_pedidos": qtd_pedidos,
                "top_produtos": top_produtos
            }

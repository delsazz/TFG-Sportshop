package com.tfg.sportshop.repository;

import com.tfg.sportshop.model.PedidoEntregaLinea;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoEntregaLineaRepository extends JpaRepository<PedidoEntregaLinea, Integer> {
    @Query("""
        SELECT linea.detalle.idDetalle, COALESCE(SUM(linea.cantidad), 0)
        FROM PedidoEntregaLinea linea
        WHERE linea.detalle.pedido.idPedido = :pedidoId
        GROUP BY linea.detalle.idDetalle
        """)
    List<Object[]> sumEntregadoPorPedido(@Param("pedidoId") Integer pedidoId);

    @Query("""
        SELECT COUNT(linea) > 0
        FROM PedidoEntregaLinea linea
        WHERE linea.detalle.pedido.idPedido = :pedidoId
        """)
    boolean existsByPedidoId(@Param("pedidoId") Integer pedidoId);
}

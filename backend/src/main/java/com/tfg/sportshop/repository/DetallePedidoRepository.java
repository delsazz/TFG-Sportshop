package com.tfg.sportshop.repository;
import java.util.List;
import org.springframework.stereotype.Repository;
import com.tfg.sportshop.model.DetallePedido;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
@Repository
public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Integer> {
    @Query("SELECT detalle FROM DetallePedido detalle WHERE detalle.pedido.idPedido = :pedidoId")
    List<DetallePedido> findByPedidoIdPedido(@Param("pedidoId") int pedidoId);
    @Query("SELECT detalle FROM DetallePedido detalle WHERE detalle.producto.idProducto = :productoId")
    List<DetallePedido> findByProductoIdProducto(@Param("productoId") int productoId);
    @Query("SELECT detalle FROM DetallePedido detalle WHERE detalle.pedido.idPedido = :pedidoId AND detalle.producto.idProducto = :productoId")
    DetallePedido findByPedidoIdPedidoAndProductoIdProducto(@Param("pedidoId") int pedidoId, @Param("productoId") int productoId);
}
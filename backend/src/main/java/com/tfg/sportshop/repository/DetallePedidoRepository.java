package com.tfg.sportshop.repository;

import com.tfg.sportshop.model.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Integer> {

    @Query("SELECT detalle FROM DetallePedido detalle WHERE detalle.pedido.idPedido = :pedidoId")
    List<DetallePedido> findByPedidoIdPedido(@Param("pedidoId") int pedidoId);
    @Query("SELECT detalle FROM DetallePedido detalle WHERE detalle.producto.idProducto = :productoId")
    List<DetallePedido> findByProductoIdProducto(@Param("productoId") int productoId);
    @Query("SELECT detalle FROM DetallePedido detalle WHERE detalle.pedido.idPedido = :pedidoId AND detalle.producto.idProducto = :productoId")
    DetallePedido findByPedidoIdPedidoAndProductoIdProducto(@Param("pedidoId") int pedidoId, @Param("productoId") int productoId);
    @Query("SELECT COUNT(detalle) > 0 FROM DetallePedido detalle WHERE detalle.producto.idProducto = :productoId")
    @Modifying
    @Query("DELETE FROM DetallePedido d WHERE d.producto.idProducto = :productoId")
    void deleteByProductoIdProducto(@Param("productoId") Integer productoId);

    @Query("SELECT COUNT(d) > 0 FROM DetallePedido d WHERE d.producto.idProducto = :productoId")
    boolean existsByProductoIdProducto(@Param("productoId") Integer idProducto);
}
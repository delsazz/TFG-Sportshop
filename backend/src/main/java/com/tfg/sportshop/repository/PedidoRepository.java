package com.tfg.sportshop.repository;

import java.util.List;
import java.util.Optional;
import com.tfg.sportshop.model.Pedido;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    @EntityGraph(attributePaths = {"usuario", "detalles", "detalles.producto"})
    @Query("SELECT DISTINCT pedido FROM Pedido pedido")
    List<Pedido> findAllWithRelations();

    @EntityGraph(attributePaths = {"usuario", "detalles", "detalles.producto"})
    @Query("SELECT pedido FROM Pedido pedido WHERE pedido.idPedido = :id")
    Optional<Pedido> findByIdWithRelations(@Param("id") Integer id);

    @Query("SELECT pedido FROM Pedido pedido WHERE pedido.usuario.idUsuario = :idUsuario ORDER BY pedido.fecha DESC")
    List<Pedido> findByUsuarioIdUsuarioOrderByFechaDesc(@Param("idUsuario") Integer idUsuario);

    long countByUsuarioIdUsuario(Integer idUsuario);

    @Modifying
    @Query("UPDATE Pedido pedido SET pedido.usuario = null WHERE pedido.usuario.idUsuario = :idUsuario")
    void desvincularUsuario(@Param("idUsuario") Integer idUsuario);
}

package com.tfg.sportshop.repository;

import com.tfg.sportshop.model.BackorderPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BackorderPedidoRepository extends JpaRepository<BackorderPedido, Integer> {

    List<BackorderPedido> findByEstado(String estado);

    List<BackorderPedido> findByIdProducto(Integer idProducto);

    void deleteByIdProducto(Integer idProducto);

    List<BackorderPedido> findByIdPedido(Integer idPedido);

    void deleteByIdPedido(Integer idPedido);

    @Query("SELECT b FROM BackorderPedido b WHERE b.estado = 'PENDIENTE' ORDER BY b.fechaCreacion ASC")
    List<BackorderPedido> findPendingBackorders();

    @Query("SELECT b FROM BackorderPedido b WHERE b.idProducto = ?1 AND b.estado = 'PENDIENTE'")
    List<BackorderPedido> findPendingByProducto(Integer idProducto);
}


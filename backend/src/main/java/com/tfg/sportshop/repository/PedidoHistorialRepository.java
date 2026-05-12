package com.tfg.sportshop.repository;

import com.tfg.sportshop.model.PedidoHistorial;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoHistorialRepository extends JpaRepository<PedidoHistorial, Integer> {
    List<PedidoHistorial> findByPedidoIdPedidoOrderByFechaCambioDesc(Integer idPedido);
}

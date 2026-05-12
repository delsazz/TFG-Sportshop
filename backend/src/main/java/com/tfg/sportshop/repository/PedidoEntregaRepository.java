package com.tfg.sportshop.repository;

import com.tfg.sportshop.model.PedidoEntrega;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoEntregaRepository extends JpaRepository<PedidoEntrega, Integer> {
    List<PedidoEntrega> findByPedidoIdPedidoOrderByFechaEntregaDesc(Integer idPedido);
}

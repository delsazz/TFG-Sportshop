package com.tfg.sportshop.repository;

import com.tfg.sportshop.model.ProveedorPedido;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProveedorPedidoRepository extends JpaRepository<ProveedorPedido, Integer> {
    @EntityGraph(attributePaths = {"lineas", "lineas.producto", "lineas.tallaEntidad"})
    List<ProveedorPedido> findAllByOrderByFechaCreacionDesc();
}

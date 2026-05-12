package com.tfg.sportshop.repository;

import com.tfg.sportshop.model.Devolucion;
import com.tfg.sportshop.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DevolucionRepository extends JpaRepository<Devolucion, Integer> {
    List<Devolucion> findByUsuario(Usuario usuario);
    List<Devolucion> findByPedidoIdPedido(Integer idPedido);
}

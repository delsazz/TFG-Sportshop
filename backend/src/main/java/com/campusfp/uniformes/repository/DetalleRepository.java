package com.campusfp.uniformes.repository;
import com.campusfp.uniformes.model.Detalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DetalleRepository extends JpaRepository<Detalle, Integer> {
    List<Detalle> findByPedido_IdPedido(Integer idPedido);
}

package com.campusfp.uniformes.repository;
import com.campusfp.uniformes.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    List<Pedido> findByUsuario_CorreoElectronico(String correo);
}

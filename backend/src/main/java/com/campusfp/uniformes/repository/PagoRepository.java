package com.campusfp.uniformes.repository;
import com.campusfp.uniformes.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Integer> {
    Optional<Pago> findByStripeSessionId(String stripeSessionId);
    Optional<Pago> findByPedido_IdPedido(Integer idPedido);
}

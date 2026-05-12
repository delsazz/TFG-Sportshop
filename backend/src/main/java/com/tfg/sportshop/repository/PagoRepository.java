package com.tfg.sportshop.repository;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import com.tfg.sportshop.model.Pago;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
@Repository
public interface PagoRepository extends JpaRepository<Pago, Integer> {
    @Override
    @EntityGraph(attributePaths = {"pedido", "pedido.usuario"})
    List<Pago> findAll();

    // Buscar todos los pagos de un pedido
    List<Pago> findByPedidoIdPedido(Integer idPedido);

    // Buscar pagos por estado
    List<Pago> findByEstado(String estado);

    // Buscar pagos por metodo de pago
    List<Pago> findByMetodoPago(String metodoPago);

    // Buscar pagos entre fechas
    List<Pago> findByFechaPagoBetween(LocalDate inicio, LocalDate fin);

    Optional<Pago> findByStripeSessionId(String stripeSessionId);
    Optional<Pago> findByStripePaymentIntentId(String stripePaymentIntentId);

    Optional<Pago> findByStripeEventId(String stripeEventId);

    Optional<Pago> findFirstByPedidoIdPedidoAndMetodoPagoAndEstadoOrderByIdPagoDesc(
        Integer idPedido,
        String metodoPago,
        String estado
    );

    Optional<Pago> findFirstByPedidoIdPedidoAndEstadoOrderByIdPagoDesc(
        Integer idPedido,
        String estado
    );
}

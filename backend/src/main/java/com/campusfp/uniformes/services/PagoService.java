package com.campusfp.uniformes.services;

import com.campusfp.uniformes.model.Pago;
import com.campusfp.uniformes.model.Pedido;
import com.campusfp.uniformes.repository.PagoRepository;
import com.campusfp.uniformes.repository.PedidoRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PagoService {
    @Autowired
    private PagoRepository pagoRepository;
    
    @Autowired
    private PedidoRepository pedidoRepository;

    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;

    public Session crearSesionStripe(Integer idPedido) throws StripeException {
        com.stripe.Stripe.apiKey = stripeSecretKey;
        
        Pedido pedido = pedidoRepository.findById(idPedido)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
            
        long importeCentimos = pedido.getTotal() * 100L;

        SessionCreateParams params = SessionCreateParams.builder()
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setClientReferenceId(pedido.getIdPedido().toString())
            .setSuccessUrl("http://localhost:5173/pagos/exito?session_id={CHECKOUT_SESSION_ID}")
            .setCancelUrl("http://localhost:5173/pagos/cancelado")
            .addLineItem(SessionCreateParams.LineItem.builder()
                .setQuantity(1L)
                .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                    .setCurrency("eur")
                    .setUnitAmount(importeCentimos)
                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                        .setName("Pedido #" + pedido.getIdPedido())
                        .build())
                    .build())
                .build())
            .build();
            
        Session session = Session.create(params);
        
        Pago pago = new Pago();
        pago.setPedido(pedido);
        pago.setMonto(pedido.getTotal());
        pago.setEstado("PENDIENTE");
        pago.setStripeSessionId(session.getId());
        pago.setFechaPago(LocalDateTime.now());
        pagoRepository.save(pago);
        
        return session;
    }

    public void procesarExito(String sessionId) {
        Pago pago = pagoRepository.findByStripeSessionId(sessionId)
            .orElseThrow(() -> new RuntimeException("Pago no encontrado"));
        pago.setEstado("PAGADO");
        pagoRepository.save(pago);
        
        Pedido pedido = pago.getPedido();
        pedido.setEstado("PAGADO");
        pedidoRepository.save(pedido);
    }
}

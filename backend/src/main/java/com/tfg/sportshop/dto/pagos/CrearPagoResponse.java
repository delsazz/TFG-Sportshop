package com.tfg.sportshop.dto.pagos;
public record CrearPagoResponse(
    Integer idPago,
    Integer idPedido,
    String estado,
    String stripeSessionId,
    String checkoutUrl,
    String clientSecret
) {
}

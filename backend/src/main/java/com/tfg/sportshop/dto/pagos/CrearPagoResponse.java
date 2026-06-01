package com.tfg.sportshop.dto.pagos;
public record CrearPagoResponse(
    Integer idPago,
    Integer idPedido,
    String estado,
    String referenciaPago,
    String redireccionUrl,
    String tokenCliente
) {
}

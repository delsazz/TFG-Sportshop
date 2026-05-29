package com.tfg.sportshop.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AdminPedidoDetalleResponse(
    Integer idPedido,
    LocalDateTime fechaPedido,
    BigDecimal total,
    String estado,
    AdminPedidoUsuarioResponse usuario,
    List<AdminPedidoLineaResponse> detalles,
    List<AdminPagoResponse> pagos,
    List<AdminPedidoHistorialResponse> historial,
    List<EntregaResponse> entregas
) {
}

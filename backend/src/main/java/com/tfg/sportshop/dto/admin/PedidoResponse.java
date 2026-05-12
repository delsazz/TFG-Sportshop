package com.tfg.sportshop.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(
    Integer idPedido,
    LocalDateTime fecha,
    BigDecimal total,
    String estado,
    List<PedidoLineaResponse> detalles,
    List<AdminPagoResponse> pagos,
    List<EntregaResponse> entregas
) {
}

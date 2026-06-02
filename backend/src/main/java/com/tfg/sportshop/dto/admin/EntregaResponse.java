package com.tfg.sportshop.dto.admin;

import java.util.List;
import java.time.LocalDateTime;

public record EntregaResponse(
    Integer idEntrega,
    LocalDateTime fechaEntrega,
    List<EntregaLineaResponse> lineas,
    String estadoPedido,
    Boolean pedidoCompletoEntregado
) {
}

package com.tfg.sportshop.dto.admin;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(
    Integer idPedido,
    @JsonProperty("fechaPedido") @JsonAlias("fecha") LocalDateTime fechaPedido,
    BigDecimal total,
    String estado,
    List<PedidoLineaResponse> detalles,
    List<AdminPagoResponse> pagos,
    List<EntregaResponse> entregas
) {
}

package com.tfg.sportshop.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminPedidoResponse(
    Integer idPedido,
    LocalDateTime fecha,
    BigDecimal total,
    String estado,
    AdminPedidoUsuarioResponse usuario,
    Integer totalLineas,
    Integer totalUnidades,
    Integer unidadesEntregadas,
    Integer unidadesPendientes
) {
}

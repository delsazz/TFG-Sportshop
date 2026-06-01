package com.tfg.sportshop.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminPagoResponse(
    Integer idPago,
    String metodoPago,
    LocalDateTime fechaPago,
    BigDecimal monto,
    String estado,
    String comprobanteUrl,
    String comprobanteNombreArchivo,
    LocalDateTime fechaConfirmacion,
    String notasAdmin
) {
}

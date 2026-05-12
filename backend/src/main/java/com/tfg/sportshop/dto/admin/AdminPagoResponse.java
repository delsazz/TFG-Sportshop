package com.tfg.sportshop.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AdminPagoResponse(
    Integer idPago,
    String metodoPago,
    LocalDate fechaPago,
    BigDecimal monto,
    String estado,
    String comprobanteUrl,
    String comprobanteNombreArchivo,
    LocalDate fechaConfirmacion,
    String notasAdmin
) {
}

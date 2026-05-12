package com.tfg.sportshop.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InformePagoDetalleResponse(
    Integer idPago,
    Integer idPedido,
    Integer idUsuario,
    String alumno,
    String email,
    String metodoPago,
    LocalDate fechaPago,
    BigDecimal monto,
    String estado
) {
}

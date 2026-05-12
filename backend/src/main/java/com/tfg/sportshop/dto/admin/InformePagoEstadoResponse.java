package com.tfg.sportshop.dto.admin;

import java.math.BigDecimal;

public record InformePagoEstadoResponse(
    String estado,
    Long cantidad,
    BigDecimal total
) {
}

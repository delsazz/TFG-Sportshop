package com.tfg.sportshop.dto.pagos;

import jakarta.validation.constraints.NotBlank;

public record ActualizarPagoEstadoRequest(
    @NotBlank(message = "El estado es requerido")
    String estado,
    String notasAdmin
) {
}

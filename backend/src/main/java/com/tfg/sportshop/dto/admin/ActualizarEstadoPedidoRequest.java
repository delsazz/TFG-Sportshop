package com.tfg.sportshop.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record ActualizarEstadoPedidoRequest(
    @NotBlank(message = "El estado es obligatorio")
    String estado
) {
}

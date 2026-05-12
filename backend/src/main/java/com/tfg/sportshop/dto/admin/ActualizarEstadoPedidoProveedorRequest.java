package com.tfg.sportshop.dto.admin;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public record ActualizarEstadoPedidoProveedorRequest(
    @NotBlank(message = "El estado es obligatorio")
    String estado,
    LocalDateTime fechaRecepcion
) {
}

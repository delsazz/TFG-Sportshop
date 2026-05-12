package com.tfg.sportshop.dto.admin;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record RegistrarEntregaLineaRequest(
    @NotNull(message = "La linea es obligatoria")
    Integer idDetalle,
    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor que cero")
    Integer cantidad
) {
}

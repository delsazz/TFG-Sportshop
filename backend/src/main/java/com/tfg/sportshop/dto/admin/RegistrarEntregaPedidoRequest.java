package com.tfg.sportshop.dto.admin;

import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

public record RegistrarEntregaPedidoRequest(
    @NotEmpty(message = "Debes seleccionar al menos una linea")
    List<@Valid RegistrarEntregaLineaRequest> lineas
) {
}

package com.tfg.sportshop.dto.admin;

import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;

public record ActualizarEntregasPedidoRequest(
    @NotEmpty(message = "Debes indicar al menos una linea")
    List<@Valid ActualizarEntregaLineaRequest> lineas
) {
    public record ActualizarEntregaLineaRequest(
        @NotNull(message = "La linea es obligatoria")
        Integer idDetalle,
        @NotNull(message = "La cantidad entregada es obligatoria")
        @Min(value = 0, message = "La cantidad entregada no puede ser negativa")
        Integer cantidadEntregada,
        @NotNull(message = "El estado de entrega es obligatorio")
        String estadoEntrega
    ) {}
}

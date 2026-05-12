package com.tfg.sportshop.dto.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.util.List;

public record ActualizarEntregasPedidoRequest(
    @NotEmpty(message = "Debes indicar al menos una linea")
    List<@Valid ActualizarEntregaLineaRequest> lineas,
    String comprobanteEntregaUrl,
    String comprobanteEntregaNombreArchivo,
    String firmaRecepcion,
    String nombreRecibe,
    String documentoRecibe,
    String observaciones
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

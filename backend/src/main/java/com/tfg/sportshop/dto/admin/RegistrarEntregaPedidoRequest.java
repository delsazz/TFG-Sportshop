package com.tfg.sportshop.dto.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record RegistrarEntregaPedidoRequest(
    @NotEmpty(message = "Debes seleccionar al menos una linea")
    List<@Valid RegistrarEntregaLineaRequest> lineas,
    String comprobanteEntregaUrl,
    String comprobanteEntregaNombreArchivo,
    String firmaRecepcion,
    String nombreRecibe,
    String documentoRecibe,
    String observaciones
) {
}

package com.tfg.sportshop.dto.admin;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CrearPedidoProveedorLineaRequest(
    @NotNull(message = "El producto es obligatorio")
    Integer idProducto,
    Integer idTalla,
    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    Integer cantidad
) {
}

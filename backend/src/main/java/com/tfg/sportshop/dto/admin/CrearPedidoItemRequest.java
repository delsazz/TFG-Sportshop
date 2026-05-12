package com.tfg.sportshop.dto.admin;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CrearPedidoItemRequest(
    @NotNull(message = "El ID del producto es requerido")
    Integer idProducto,

    Integer idTalla,

    String talla,

    @NotNull(message = "La cantidad es requerida")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    Integer cantidad
) {
}

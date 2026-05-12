package com.tfg.sportshop.dto.admin;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record AdminActualizarPedidoRequest(
    @NotNull(message = "El ID del usuario es requerido")
    Integer idUsuario,

    @NotNull(message = "El estado del pedido es requerido")
    String estado,

    @NotNull(message = "Los items del pedido son requeridos")
    @NotEmpty(message = "Debe haber al menos un item en el pedido")
    List<CrearPedidoItemRequest> items
) {
}

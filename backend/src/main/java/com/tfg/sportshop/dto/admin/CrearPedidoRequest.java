package com.tfg.sportshop.dto.admin;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CrearPedidoRequest(
    @NotNull(message = "Los items del pedido son requeridos")
    @NotEmpty(message = "Debe haber al menos un item en el pedido")
    List<CrearPedidoItemRequest> items,
    @NotNull(message = "El metodo de pago es requerido")
    @NotEmpty(message = "El metodo de pago es requerido")
    String metodoPago
) {
}

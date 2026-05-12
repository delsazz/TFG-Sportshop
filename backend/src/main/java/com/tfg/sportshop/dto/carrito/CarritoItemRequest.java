package com.tfg.sportshop.dto.carrito;

import java.math.BigDecimal;

public record CarritoItemRequest(
        Integer productoId,
        String talla,
        Integer cantidad,
        BigDecimal precioUnitario
) {
}

package com.tfg.sportshop.dto.carrito;

import java.math.BigDecimal;
import java.util.List;

public record CarritoItemResponse(
        Integer productoId,
        String nombre,
        String talla,
        List<String> tallasDisponibles,
        Integer cantidad,
        BigDecimal precioUnitario,
        String imagen
) {
}

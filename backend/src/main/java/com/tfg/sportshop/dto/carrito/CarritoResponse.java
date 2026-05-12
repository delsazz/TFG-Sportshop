package com.tfg.sportshop.dto.carrito;

import java.math.BigDecimal;
import java.util.List;

public record CarritoResponse(
        List<CarritoItemResponse> items,
        BigDecimal total,
        String currency
) {
}

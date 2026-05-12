package com.tfg.sportshop.dto.carrito;

import java.util.List;

public record CarritoRequest(
        List<CarritoItemRequest> items
) {
}

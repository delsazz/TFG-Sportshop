package com.tfg.sportshop.dto.admin;

import java.math.BigDecimal;

public record InformeStockProductoResponse(
    Integer idProducto,
    String nombre,
    String tipoPrenda,
    String color,
    String categoria,
    BigDecimal precio,
    Integer stock,
    String estado
) {
}

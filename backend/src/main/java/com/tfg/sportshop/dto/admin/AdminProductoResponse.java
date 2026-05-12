package com.tfg.sportshop.dto.admin;

import java.math.BigDecimal;

public record AdminProductoResponse(
    Integer idProducto,
    String nombre,
    String tipoPrenda,
    String color,
    BigDecimal precio,
    Integer stock,
    String imagen,
    String descripcion,
    String composicion,
    String normativa,
    String instruccionesLavado,
    String consejos,
    AdminCategoriaResponse categoria
) {
}

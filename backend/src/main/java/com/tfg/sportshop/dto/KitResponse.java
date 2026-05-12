package com.tfg.sportshop.dto;

import java.math.BigDecimal;
import java.util.List;

public record KitResponse(
    Integer idKit,
    String nombre,
    String descripcion,
    BigDecimal precio,
    String imagen,
    Integer stock,
    Integer categoriaId,
    String categoriaNombre,
    List<KitProductoResponse> productos
) {
    public record KitProductoResponse(
        Integer productoId,
        String nombre,
        String tipoPrenda,
        String color,
        BigDecimal precio,
        String imagen,
        Integer cantidad,
        List<String> tallasDisponibles
    ) {}
}




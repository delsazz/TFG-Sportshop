package com.tfg.sportshop.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AdminKitResponse(
    Integer idKit,
    String nombre,
    String descripcion,
    BigDecimal precio,
    Integer stock,
    String imagen,
    Boolean activo,
    LocalDateTime fechaCreacion,
    LocalDateTime fechaActualizacion,
    AdminCategoriaResponse categoria,
    List<AdminKitProductoResponse> productos
) {
    public record AdminKitProductoResponse(
        Integer idKitProducto,
        AdminProductoResponse producto,
        Integer cantidad
    ) {}
}


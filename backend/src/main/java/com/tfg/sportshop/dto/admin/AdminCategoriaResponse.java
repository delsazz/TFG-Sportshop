package com.tfg.sportshop.dto.admin;

public record AdminCategoriaResponse(
    Integer idCategoria,
    String nombreCategoria,
    String slug,
    String descripcion,
    String imagenUrl,
    Integer ordenVisualizacion,
    Integer totalProductos
) {
}

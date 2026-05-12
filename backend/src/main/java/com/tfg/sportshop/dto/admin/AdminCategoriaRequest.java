package com.tfg.sportshop.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record AdminCategoriaRequest(
    @NotBlank(message = "El nombre es obligatorio")
    String nombreCategoria,
    @NotBlank(message = "El slug es obligatorio")
    String slug,
    String descripcion,
    String imagenUrl,
    @NotNull(message = "El orden es obligatorio")
    Integer ordenVisualizacion,
    List<Integer> productoIds
) {
}

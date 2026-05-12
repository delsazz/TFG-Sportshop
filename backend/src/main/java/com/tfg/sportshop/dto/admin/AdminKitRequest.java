package com.tfg.sportshop.dto.admin;

import java.math.BigDecimal;
import java.util.List;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminKitRequest(
    @NotBlank(message = "El nombre del kit es obligatorio")
    String nombre,
    String descripcion,
    BigDecimal precio,
    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    Integer stock,
    @NotNull(message = "La categoria es obligatoria")
    Integer categoriaId,
    String imagen,
    @NotNull(message = "El kit debe contener al menos un producto")
    List<KitProductoRequest> productos
) {
    public record KitProductoRequest(
        @NotNull(message = "El ID del producto es obligatorio")
        Integer productoId,
        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad debe ser mayor a 0")
        Integer cantidad
    ) {}
}


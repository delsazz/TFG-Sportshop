package com.tfg.sportshop.dto.admin;

import java.math.BigDecimal;
import java.util.List;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminProductoRequest(
    @NotBlank(message = "El nombre es obligatorio")
    String nombre,
    String tipoPrenda,
    String color,
    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", inclusive = true, message = "El precio no puede ser negativo")
    BigDecimal precio,
    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    Integer stock,
    @NotNull(message = "La categoria es obligatoria")
    Integer categoriaId,
    List<TallaStockRequest> tallas,
    String descripcion,
    String composicion,
    String normativa,
    String instruccionesLavado,
    String consejos,
    @Min(value = 0, message = "El stock minimo no puede ser negativo")
    Integer stockMinimo
) {
    public record TallaStockRequest(
        @NotBlank String talla,
        @NotNull @Min(0) Integer stock
    ) {}
}

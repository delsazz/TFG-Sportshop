package com.tfg.sportshop.dto.admin;

import jakarta.validation.constraints.Min;

public record ActualizarProveedorProductoRequest(
    String proveedor,
    String referenciaProveedor,
    @Min(value = 0, message = "El stock minimo no puede ser negativo")
    Integer stockMinimo,
    @Min(value = 1, message = "El lote de compra debe ser al menos 1")
    Integer loteCompra,
    @Min(value = 0, message = "El plazo de reposicion no puede ser negativo")
    Integer plazoReposicionDias
) {
}

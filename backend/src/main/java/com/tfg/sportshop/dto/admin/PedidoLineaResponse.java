package com.tfg.sportshop.dto.admin;

import java.math.BigDecimal;

public record PedidoLineaResponse(
    Integer idDetalle,
    Integer idProducto,
    String nombreProducto,
    String talla,
    Integer cantidad,
    BigDecimal precioUnitario,
    String imagen
) {
}

package com.tfg.sportshop.dto.admin;

import java.math.BigDecimal;

public record AdminPedidoLineaResponse(
    Integer idDetalle,
    Integer cantidad,
    Integer cantidadEntregada,
    Integer cantidadPendiente,
    BigDecimal precioUnitario,
    Integer idProducto,
    String productoNombre,
    Integer idTalla,
    String tallaNombre,
    String estadoEntrega,
    String imagen,
    Integer cantidadSatisfecha,
    Boolean esBackorder
) {
}

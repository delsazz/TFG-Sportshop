package com.tfg.sportshop.dto.admin;

public record EntregaLineaResponse(
    Integer idDetalle,
    String nombreProducto,
    Integer cantidadPedida,
    Integer cantidadEntregadaAnterior,
    Integer cantidadEntregadaAhora,
    Integer cantidadTotalEntregada,
    Integer cantidadPendiente
) {
}

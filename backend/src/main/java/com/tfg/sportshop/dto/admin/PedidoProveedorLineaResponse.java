package com.tfg.sportshop.dto.admin;

public record PedidoProveedorLineaResponse(
    Integer idLineaProveedor,
    Integer idProducto,
    Integer idTalla,
    String referenciaProveedor,
    String nombreProducto,
    String talla,
    Integer cantidad,
    Integer stockDisponible,
    Integer pendienteEntrega,
    Integer stockProyectado,
    String prioridad
) {
}

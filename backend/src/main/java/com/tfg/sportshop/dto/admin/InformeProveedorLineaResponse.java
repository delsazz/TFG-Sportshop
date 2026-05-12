package com.tfg.sportshop.dto.admin;

public record InformeProveedorLineaResponse(
    Integer idProducto,
    String producto,
    String tipoPrenda,
    String color,
    Integer idTalla,
    String talla,
    String proveedor,
    String referenciaProveedor,
    Integer stockDisponible,
    Integer stockMinimo,
    Integer pendienteEntrega,
    Integer entrante,
    Integer stockProyectado,
    Integer cantidadSugerida,
    Integer loteCompra,
    Integer plazoReposicionDias,
    String prioridad
) {
}

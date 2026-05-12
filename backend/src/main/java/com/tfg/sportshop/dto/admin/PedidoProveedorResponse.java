package com.tfg.sportshop.dto.admin;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoProveedorResponse(
    Integer idPedidoProveedor,
    String proveedor,
    LocalDateTime fechaCreacion,
    String estado,
    String observaciones,
    String direccionEntrega,
    String contactoEntrega,
    String telefonoEntrega,
    LocalDate fechaPrevistaEntrega,
    LocalDateTime fechaRecepcion,
    Integer totalUnidades,
    List<PedidoProveedorLineaResponse> lineas
) {
}

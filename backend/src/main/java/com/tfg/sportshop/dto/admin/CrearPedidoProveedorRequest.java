package com.tfg.sportshop.dto.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDate;
import java.util.List;

public record CrearPedidoProveedorRequest(
    @NotBlank(message = "El proveedor es obligatorio")
    String proveedor,
    String observaciones,
    String direccionEntrega,
    String contactoEntrega,
    String telefonoEntrega,
    LocalDate fechaPrevistaEntrega,
    @NotEmpty(message = "El pedido debe tener al menos una linea")
    List<@Valid CrearPedidoProveedorLineaRequest> lineas
) {
}

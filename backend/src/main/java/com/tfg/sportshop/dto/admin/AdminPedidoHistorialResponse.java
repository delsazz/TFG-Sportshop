package com.tfg.sportshop.dto.admin;

import java.time.LocalDateTime;

public record AdminPedidoHistorialResponse(
    Integer idHistorial,
    LocalDateTime fechaCambio,
    String tipoEvento,
    String estadoAnterior,
    String estadoNuevo,
    String descripcion
) {
}

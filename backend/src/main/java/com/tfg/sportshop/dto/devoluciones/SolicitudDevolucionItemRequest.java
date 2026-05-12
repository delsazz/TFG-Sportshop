package com.tfg.sportshop.dto.devoluciones;

public record SolicitudDevolucionItemRequest(
    Integer idDetallePedido,
    Integer cantidad
) {}

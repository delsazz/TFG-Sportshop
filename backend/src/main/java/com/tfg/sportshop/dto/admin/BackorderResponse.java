package com.tfg.sportshop.dto.admin;

import java.time.LocalDateTime;

public record BackorderResponse(
    Integer idBackorder,
    Integer idPedido,
    Integer idProducto,
    String nombreProducto,
    String talla,
    Integer stockActual,
    Integer cantidadFaltante,
    Integer cantidadRecibidaParcial,
    LocalDateTime fechaCreacion,
    LocalDateTime fechaResuelto,
    String estado,
    String observaciones
) {}


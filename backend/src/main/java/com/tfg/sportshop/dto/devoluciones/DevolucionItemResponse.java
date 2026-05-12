package com.tfg.sportshop.dto.devoluciones;

import java.math.BigDecimal;

public record DevolucionItemResponse(
    Integer idDevolucionItem,
    Integer idDetallePedido,
    String productoNombre,
    String tallaNombre,
    Integer cantidad,
    BigDecimal precioUnitario,
    String imagen
) {}

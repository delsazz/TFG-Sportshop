package com.tfg.sportshop.dto.devoluciones;

import java.util.List;

public record SolicitudDevolucionRequest(
    Integer idPedido,
    String motivo,
    List<SolicitudDevolucionItemRequest> items
) {}

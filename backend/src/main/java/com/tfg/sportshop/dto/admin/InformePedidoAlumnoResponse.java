package com.tfg.sportshop.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InformePedidoAlumnoResponse(
    Integer idUsuario,
    String nombre,
    String apellidos,
    String email,
    Long totalPedidos,
    BigDecimal importeTotal,
    LocalDateTime ultimoPedido
) {
}

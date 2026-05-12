package com.tfg.sportshop.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record InformePedidosResponse(
    LocalDate fechaDesde,
    LocalDate fechaHasta,
    String estado,
    Long totalPedidos,
    Long totalAlumnos,
    BigDecimal importeTotal,
    List<InformePedidoAlumnoResponse> pedidosPorAlumno,
    List<AdminPedidoResponse> pedidos
) {
}

package com.tfg.sportshop.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record InformePagosResponse(
    LocalDate fechaDesde,
    LocalDate fechaHasta,
    String estado,
    Long totalPagos,
    BigDecimal importeTotal,
    BigDecimal importePendiente,
    BigDecimal importeCompletado,
    List<InformePagoEstadoResponse> resumenPorEstado,
    List<InformePagoDetalleResponse> pagos
) {
}

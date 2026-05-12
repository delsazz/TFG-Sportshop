package com.tfg.sportshop.dto.admin;

import java.time.LocalDateTime;
import java.util.List;

public record InformeProveedorResponse(
    LocalDateTime generadoEn,
    Long totalReferencias,
    Long referenciasCriticas,
    Integer unidadesPendientesEntrega,
    Integer unidadesSugeridasCompra,
    List<InformeProveedorLineaResponse> lineas
) {
}

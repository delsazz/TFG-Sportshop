package com.tfg.sportshop.dto.configuracion;

import java.time.LocalDateTime;

public record ConfiguracionSitioResponse(
    Integer idConfiguracion,
    String logoHeaderUrl,
    String logoFooterUrl,
    String logoLoginUrl,
    String logoHomeUrl,
    String logoAdminUrl,
    boolean tarjetaHabilitada,
    LocalDateTime updatedAt
) {
}

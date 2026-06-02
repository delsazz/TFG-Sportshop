package com.tfg.sportshop.dto.configuracion;

import java.time.LocalDateTime;

public record ConfiguracionPagoResponse(
        Integer idConfiguracion,
        boolean tarjetaHabilitada,
        LocalDateTime updatedAt
) {}
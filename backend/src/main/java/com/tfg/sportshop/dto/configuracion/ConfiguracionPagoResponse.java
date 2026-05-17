package com.tfg.sportshop.dto.configuracion;

import java.time.LocalDateTime;

public record ConfiguracionPagoResponse(
        Integer idConfiguracion,
        String bizumTelefono,
        String bizumBancoUrl,
        String transferenciaTitular,
        String transferenciaIban,
        String transferenciaConcepto,
        String transferenciaNotas,
        boolean tarjetaHabilitada,
        boolean bizumHabilitado,
        boolean transferenciaHabilitada,
        boolean mostradorHabilitado,
        LocalDateTime updatedAt
) {}
package com.tfg.sportshop.dto.configuracion;

import java.time.LocalDateTime;

public record ConfiguracionSitioResponse(
    Integer idConfiguracion,
    String logoHeaderUrl,
    String logoFooterUrl,
    String logoLoginUrl,
    String logoHomeUrl,
    String logoAdminUrl,
    String bizumTelefono,
    String bizumBancoUrl,
    String transferenciaTitular,
    String transferenciaIban,
    String transferenciaConcepto,
    String transferenciaNotas,
    String emailBienvenidaAsunto,
    String emailBienvenidaCuerpo,
    String emailPedidoCreadoAsunto,
    String emailPedidoCreadoCuerpo,
    String emailCambioEstadoAsunto,
    String emailCambioEstadoCuerpo,
    String emailCambioPasswordAsunto,
    String emailCambioPasswordCuerpo,
    boolean tarjetaHabilitada,
    boolean bizumHabilitado,
    boolean transferenciaHabilitada,
    boolean mostradorHabilitado,
    LocalDateTime updatedAt
) {
}

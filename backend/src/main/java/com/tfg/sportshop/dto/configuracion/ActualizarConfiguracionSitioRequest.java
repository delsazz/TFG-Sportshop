package com.tfg.sportshop.dto.configuracion;

public record ActualizarConfiguracionSitioRequest(
    String bizumTelefono,
    String bizumBancoUrl,
    String transferenciaTitular,
    String transferenciaIban,
    String transferenciaConcepto,
    String transferenciaNotas,
    Boolean tarjetaHabilitada,
    Boolean bizumHabilitado,
    Boolean transferenciaHabilitada,
    Boolean mostradorHabilitado
) {
}


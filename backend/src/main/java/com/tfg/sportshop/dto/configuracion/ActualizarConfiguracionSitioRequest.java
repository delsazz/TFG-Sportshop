package com.tfg.sportshop.dto.configuracion;

public record ActualizarConfiguracionSitioRequest(
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
    Boolean tarjetaHabilitada,
    Boolean bizumHabilitado,
    Boolean transferenciaHabilitada,
    Boolean mostradorHabilitado
) {
}
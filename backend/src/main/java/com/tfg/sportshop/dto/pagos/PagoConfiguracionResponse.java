package com.tfg.sportshop.dto.pagos;

public record PagoConfiguracionResponse(
    String bizumTelefono,
    String bizumBancoUrl,
    String transferenciaTitular,
    String transferenciaIban,
    String transferenciaConcepto,
    String transferenciaNotas,
    boolean tarjetaHabilitada,
    boolean bizumHabilitado,
    boolean transferenciaHabilitada,
    boolean mostradorHabilitado
) {
}

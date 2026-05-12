package com.tfg.sportshop.dto.pagos;

import jakarta.validation.constraints.NotBlank;

public record ConfirmarPagoTarjetaRequest(
    @NotBlank(message = "El paymentIntentId es requerido")
    String paymentIntentId
) {
}

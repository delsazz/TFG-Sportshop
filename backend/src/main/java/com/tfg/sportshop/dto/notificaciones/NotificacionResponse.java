package com.tfg.sportshop.dto.notificaciones;

import java.time.LocalDateTime;

public record NotificacionResponse(
    Integer idNotificacion,
    Integer idPedido,
    String canal,
    String titulo,
    String mensaje,
    String estadoPedido,
    LocalDateTime fechaEnvio,
    String emailDestinatario,
    Boolean emailEnviado,
    LocalDateTime fechaEmail,
    Boolean leida
) {
}

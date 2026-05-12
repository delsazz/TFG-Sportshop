package com.tfg.sportshop.dto.devoluciones;

import com.tfg.sportshop.model.DevolucionEstado;
import java.time.LocalDateTime;
import java.util.List;

public record DevolucionResponse(
    Integer idDevolucion,
    Integer idPedido,
    Integer idUsuario,
    String usuarioNombre,
    String motivo,
    DevolucionEstado estado,
    LocalDateTime fechaSolicitud,
    LocalDateTime fechaResolucion,
    String comentariosAdmin,
    List<DevolucionItemResponse> items
) {}

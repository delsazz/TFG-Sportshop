package com.tfg.sportshop.dto.devoluciones;

import com.tfg.sportshop.model.DevolucionEstado;

public record ActualizarEstadoDevolucionRequest(
    DevolucionEstado estado,
    String comentarios
) {}

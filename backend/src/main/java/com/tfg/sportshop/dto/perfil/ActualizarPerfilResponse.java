package com.tfg.sportshop.dto.perfil;

public record ActualizarPerfilResponse(
        String mensaje,
        String token,
        PerfilUsuarioResponse usuario
) {
}

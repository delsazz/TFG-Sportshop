package com.tfg.sportshop.dto.perfil;

import java.util.List;

public record PerfilUsuarioResponse(
        Integer idUsuario,
        String nombre,
        String apellidos,
        String email,
        String telefono,
        String direccion,
        String direccionCalle,
        String direccionNumero,
        String direccionPiso,
        String direccionCiudad,
        String direccionProvincia,
        String codigoPostal,
        Integer totalPedidos,
        List<String> roles
) {
}

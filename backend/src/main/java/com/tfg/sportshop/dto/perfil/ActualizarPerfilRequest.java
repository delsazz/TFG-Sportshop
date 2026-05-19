package com.tfg.sportshop.dto.perfil;

public record ActualizarPerfilRequest(
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
        String avatarUrl
) {
}

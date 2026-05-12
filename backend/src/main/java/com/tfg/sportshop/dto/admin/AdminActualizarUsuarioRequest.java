package com.tfg.sportshop.dto.admin;

public record AdminActualizarUsuarioRequest(
    String nombre,
    String apellidos,
    String email,
    String telefono,
    String direccion
) {
}

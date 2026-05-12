package com.tfg.sportshop.dto.admin;

public record AdminPedidoUsuarioResponse(
    Integer idUsuario,
    String nombre,
    String apellidos,
    String email
) {
}

package com.tfg.sportshop.dto.admin;

import java.util.List;

public record AdminUsuarioResponse(
    Integer idUsuario,
    String nombre,
    String apellidos,
    String email,
    String telefono,
    String direccion,
    Integer totalPedidos,
    List<AdminRolResponse> roles,
    String comunidadAutonoma,
    String provincia,
    String ciudad,
    String direccionCalle,
    String direccionNumero,
    String direccionPiso
) {
}

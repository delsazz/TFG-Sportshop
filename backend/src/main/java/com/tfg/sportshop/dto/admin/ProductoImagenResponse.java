package com.tfg.sportshop.dto.admin;

public record ProductoImagenResponse(
    Integer idImagen,
    String urlImagen,
    String altText,
    Integer orden,
    Boolean esPrincipal
) {
}

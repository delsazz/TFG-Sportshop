package com.tfg.sportshop.dto.admin;

public record ProductoDocumentoResponse(
    Integer idDocumento,
    String nombre,
    String urlDocumento,
    String tipo
) {}


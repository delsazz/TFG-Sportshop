package com.tfg.sportshop.dto.admin;

import java.time.LocalDateTime;
import java.util.List;

public record EntregaResponse(
    Integer idEntrega,
    LocalDateTime fechaEntrega,
    List<EntregaLineaResponse> lineas,
    String comprobanteEntregaUrl,
    String comprobanteEntregaNombreArchivo,
    String firmaRecepcion,
    String nombreRecibe,
    String documentoRecibe,
    String tipoReceptor,
    String autorizanteNombre,
    String autorizanteDocumento,
    String textoAutorizacion,
    String observaciones,
    String estadoPedido,
    Boolean pedidoCompletoEntregado
) {
}

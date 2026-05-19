package com.tfg.sportshop.dto.pedidos;

public record FirmarEntregaPedidoRequest(
    String tipoReceptor,
    String nombreRecibe,
    String documentoRecibe,
    String autorizanteNombre,
    String autorizanteDocumento,
    String textoAutorizacion,
    String firmaRecepcion
) {
}

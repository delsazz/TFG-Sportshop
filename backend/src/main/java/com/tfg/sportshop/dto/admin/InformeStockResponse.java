package com.tfg.sportshop.dto.admin;

import java.util.List;

public record InformeStockResponse(
    String estado,
    Long totalProductos,
    Long totalUnidades,
    Long productosAgotados,
    Long productosBajoStock,
    List<InformeStockProductoResponse> productos
) {
}

package com.tfg.sportshop.controller;

import com.tfg.sportshop.model.Producto;
import com.tfg.sportshop.services.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    @Autowired
    private ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<Producto>> getAllProductos() {
        return ResponseEntity.ok(productoService.verProductos());
    }

    @GetMapping("/{idProducto}")
    public ResponseEntity<Producto> getProducto(@PathVariable Integer idProducto) {
        Producto producto = productoService.buscarProductoPorId(idProducto.longValue());
        return ResponseEntity.ok(producto);
    }
}

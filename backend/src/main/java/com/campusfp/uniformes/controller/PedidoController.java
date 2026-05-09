package com.campusfp.uniformes.controller;

import com.campusfp.uniformes.model.Pedido;
import com.campusfp.uniformes.services.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {
    @Autowired
    private PedidoService pedidoService;

    @GetMapping("/usuario/{correo}")
    public ResponseEntity<List<Pedido>> getPedidosUsuario(@PathVariable String correo) {
        return ResponseEntity.ok(pedidoService.obtenerPorUsuario(correo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> getPedido(@PathVariable Integer id) {
        return pedidoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

package com.tfg.sportshop.controller;

import com.tfg.sportshop.dto.carrito.CarritoRequest;
import com.tfg.sportshop.dto.carrito.CarritoResponse;
import com.tfg.sportshop.model.Usuario;
import com.tfg.sportshop.services.CarritoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
public class CarritoController {
    private final CarritoService carritoService;

    public CarritoController(CarritoService carritoService) {
        this.carritoService = carritoService;
    }

    @GetMapping("/api/carrito")
    public CarritoResponse obtenerCarrito() {
        return carritoService.obtenerCarrito(getUsuarioAutenticado());
    }

    @PutMapping("/api/carrito")
    public CarritoResponse guardarCarrito(@RequestBody CarritoRequest request) {
        return carritoService.guardarCarrito(
                getUsuarioAutenticado(),
                request == null ? null : request.items()
        );
    }

    @DeleteMapping("/api/carrito")
    public ResponseEntity<Void> limpiarCarrito() {
        carritoService.limpiarCarrito(getUsuarioAutenticado());
        return ResponseEntity.noContent().build();
    }

    private Usuario getUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof Usuario usuario)) {
            throw new ResponseStatusException(UNAUTHORIZED, "Usuario no autenticado");
        }

        return usuario;
    }
}

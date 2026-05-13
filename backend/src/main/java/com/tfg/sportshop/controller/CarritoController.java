package com.tfg.sportshop.controller;

import com.tfg.sportshop.model.Usuario;
import org.springframework.http.ResponseEntity;
import com.tfg.sportshop.services.CarritoService;
import org.springframework.web.bind.annotation.*;
import com.tfg.sportshop.dto.carrito.CarritoRequest;
import com.tfg.sportshop.dto.carrito.CarritoResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.context.SecurityContextHolder;

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
    public CarritoResponse guardarCarrito(@RequestBody CarritoRequest carritoRequest) {
        return carritoService.guardarCarrito(
                getUsuarioAutenticado(),
                carritoRequest == null ? null : carritoRequest.items()
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

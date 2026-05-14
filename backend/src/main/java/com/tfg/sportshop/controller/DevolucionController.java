package com.tfg.sportshop.controller;

import jakarta.validation.Valid;
import com.tfg.sportshop.model.Usuario;
import com.tfg.sportshop.model.Devolucion;
import org.springframework.http.HttpStatus;
import com.tfg.sportshop.dto.devoluciones.*;
import com.tfg.sportshop.model.DevolucionItem;
import org.springframework.web.bind.annotation.*;
import com.tfg.sportshop.services.DevolucionService;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
public class DevolucionController {

    @Autowired
    private DevolucionService devolucionService;

    @PostMapping("/api/devoluciones")
    public DevolucionResponse solicitarDevolucion(@Valid @RequestBody SolicitudDevolucionRequest request) {
        Usuario usuario = getUsuarioAutenticado();
        Devolucion devolucion = devolucionService.solicitarDevolucion(usuario, request);
        return toResponse(devolucion);
    }

    @GetMapping("/api/devoluciones/mis-devoluciones")
    public List<DevolucionResponse> misDevoluciones() {
        Usuario usuario = getUsuarioAutenticado();
        return devolucionService.listarDevolucionesUsuario(usuario).stream().map(this::toResponse) .toList();
    }

    @GetMapping("/api/admin/devoluciones")
    public List<DevolucionResponse> verTodas() {
        validarAdministrador();
        return devolucionService.listarTodasLasDevoluciones().stream().map(this::toResponse).toList();
    }

    @GetMapping("/api/devoluciones/{id}")
    public DevolucionResponse verDetalle(@PathVariable Integer id) {
        Usuario usuario = getUsuarioAutenticado();
        Devolucion devolucion = devolucionService.obtenerDevolucion(id);
        boolean esAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if(!esAdmin && !devolucion.getUsuario().getIdUsuario().equals(usuario.getIdUsuario())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para ver esta devolución");
        }
        return toResponse(devolucion);
    }

    @PutMapping("/api/admin/devoluciones/{id}/estado")
    public DevolucionResponse actualizarEstado(
            @PathVariable Integer id,
            @Valid @RequestBody ActualizarEstadoDevolucionRequest request) {
        validarAdministrador();
        Devolucion devolucion = devolucionService.actualizarEstadoDevolucion(id, request.estado(), request.comentarios());
        return toResponse(devolucion);
    }

    private DevolucionResponse toResponse(Devolucion devolucion) {
        List<DevolucionItemResponse> items = devolucion.getItems().stream()
                .map(item -> new DevolucionItemResponse(
                        item.getIdDevolucionItem(),
                        item.getDetallePedido().getIdDetalle(),
                        item.getDetallePedido().getProducto().getNombre(),
                        item.getDetallePedido().getTalla() != null ? item.getDetallePedido().getTalla().getNombre() : null,
                        item.getCantidad(),
                        item.getDetallePedido().getPrecioUnitario(),
                        item.getDetallePedido().getProducto().getImagen()
                )).toList();
        return new DevolucionResponse(
                devolucion.getIdDevolucion(),
                devolucion.getPedido().getIdPedido(),
                devolucion.getUsuario().getIdUsuario(),
                devolucion.getUsuario().getNombre() + " " + devolucion.getUsuario().getApellidos(),
                devolucion.getMotivo(),
                devolucion.getEstado(),
                devolucion.getFechaSolicitud(),
                devolucion.getFechaResolucion(),
                devolucion.getComentariosAdmin(),
                items
        );
    }

    private Usuario getUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof Usuario)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        return (Usuario) auth.getPrincipal();
    }

    private void validarAdministrador() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean esAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equalsIgnoreCase(authority.getAuthority()));
        if(!esAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Se requieren permisos de administrador");
        }
    }
}
package com.tfg.sportshop.controller;

import java.util.Map;
import java.util.List;
import com.tfg.sportshop.model.Usuario;
import org.springframework.http.HttpStatus;
import com.tfg.sportshop.model.Notificacion;
import com.tfg.sportshop.services.NotificacionService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import com.tfg.sportshop.dto.notificaciones.NotificacionResponse;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
public class NotificacionController {
    private final NotificacionService notificacionService;
    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    @GetMapping("/api/notificaciones")
    public List<NotificacionResponse> misNotificaciones() {
        Usuario usuario = requireUsuario();
        return notificacionService.buscarPorUsuario(usuario).stream().map(this::toResponse).toList();       
    }

    @GetMapping("/api/notificaciones/no-leidas")
    public Map<String, Long> contarNoLeidas() {
        Usuario usuario = requireUsuario();
        return Map.of("total", notificacionService.contarNoLeidas(usuario));
    }

    @PatchMapping("/api/notificaciones/{id}/leida")
    public NotificacionResponse marcarComoLeida(@PathVariable Integer id) {
        Usuario usuario = requireUsuario();
        return toResponse(notificacionService.marcarComoLeida(id, usuario));
    }

    private Usuario requireUsuario() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof Usuario usuario)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        return usuario;
    }

    private NotificacionResponse toResponse(Notificacion notificacion) {
        return new NotificacionResponse(notificacion.getIdNotificacion(), notificacion.getPedido().getIdPedido(),
            notificacion.getCanal(), notificacion.getTitulo(), notificacion.getMensaje(), notificacion.getEstadoPedido(),
            notificacion.getFechaEnvio(), notificacion.getEmailDestinatario(), notificacion.getEmailEnviado(),
            notificacion.getFechaEmail(), notificacion.getLeida());
    }
}
package com.tfg.sportshop.controller;

import com.tfg.sportshop.dto.configuracion.ActualizarConfiguracionSitioRequest;
import com.tfg.sportshop.dto.configuracion.ConfiguracionSitioResponse;
import com.tfg.sportshop.model.Usuario;
import com.tfg.sportshop.services.ConfiguracionSitioService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/configuracion")
public class ConfiguracionSitioController {
    private final ConfiguracionSitioService configuracionSitioService;

    public ConfiguracionSitioController(ConfiguracionSitioService configuracionSitioService) {
        this.configuracionSitioService = configuracionSitioService;
    }

    @GetMapping
    public ResponseEntity<ConfiguracionSitioResponse> obtenerConfiguracionPublica() {
        return ResponseEntity.ok(configuracionSitioService.obtenerConfiguracion());
    }

    @GetMapping("/admin")
    public ResponseEntity<ConfiguracionSitioResponse> obtenerConfiguracionAdmin() {
        requireAdmin();
        return ResponseEntity.ok(configuracionSitioService.obtenerConfiguracion());
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, path = "/admin")
    public ResponseEntity<ConfiguracionSitioResponse> actualizarConfiguracion(
        @RequestPart("config") ActualizarConfiguracionSitioRequest request,
        @RequestPart(value = "logoHeader", required = false) MultipartFile logoHeader,
        @RequestPart(value = "logoFooter", required = false) MultipartFile logoFooter,
        @RequestPart(value = "logoLogin", required = false) MultipartFile logoLogin,
        @RequestPart(value = "logoHome", required = false) MultipartFile logoHome,
        @RequestPart(value = "logoAdmin", required = false) MultipartFile logoAdmin
    ) {
        requireAdmin();
        return ResponseEntity.ok(configuracionSitioService.actualizarConfiguracion(
            request,
            logoHeader,
            logoFooter,
            logoLogin,
            logoHome,
            logoAdmin
        ));
    }

    private void requireAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Usuario usuario)) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED,
                "Usuario no autenticado"
            );
        }

        boolean isAdmin = usuario.getRoles() != null && usuario.getRoles().stream()
            .anyMatch(rol -> "ADMIN".equalsIgnoreCase(rol.getNombreRol()));
        if (!isAdmin) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN,
                "Se requieren permisos de administrador"
            );
        }
    }
}


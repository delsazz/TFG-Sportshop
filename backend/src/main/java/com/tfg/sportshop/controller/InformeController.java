package com.tfg.sportshop.controller;

import java.time.LocalDate;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import com.tfg.sportshop.services.InformeService;
import com.tfg.sportshop.dto.admin.InformePagosResponse;
import com.tfg.sportshop.dto.admin.InformeStockResponse;
import org.springframework.security.core.Authentication;
import com.tfg.sportshop.dto.admin.InformePedidosResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/admin/informes")
public class InformeController {
    private final InformeService informeService;
    public InformeController(InformeService informeService) {
        this.informeService = informeService;
    }

    @GetMapping("/pedidos")
    public InformePedidosResponse informePedidos(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
        @RequestParam(required = false) String estado
    ) {
        validarAdministrador();
        return informeService.obtenerInformePedidos(fechaDesde, fechaHasta, estado);
    }

    @GetMapping("/stock")
    public InformeStockResponse informeStock(@RequestParam(required = false) String estado) {
        validarAdministrador();
        return informeService.obtenerInformeStock(estado);
    }

    @GetMapping("/pagos")
    public InformePagosResponse informePagos(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
        @RequestParam(required = false) String estado) {
        validarAdministrador();
        return informeService.obtenerInformePagos(fechaDesde, fechaHasta, estado);
    }

    private void validarAdministrador() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        boolean esAdmin = auth.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_ADMIN".equalsIgnoreCase(authority.getAuthority()));
        if(!esAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Se requieren permisos de administrador");
        }
    }
}

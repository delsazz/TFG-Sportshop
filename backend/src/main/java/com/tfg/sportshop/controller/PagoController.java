package com.tfg.sportshop.controller;

import java.util.Map;
import jakarta.validation.Valid;
import com.tfg.sportshop.model.Pago;
import org.springframework.http.MediaType;
import com.tfg.sportshop.model.Usuario;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import com.tfg.sportshop.services.PagoService;
import com.tfg.sportshop.services.PagoConfiguracionService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import com.tfg.sportshop.dto.pagos.CrearPagoRequest;
import com.tfg.sportshop.dto.pagos.CrearPagoResponse;
import com.tfg.sportshop.dto.pagos.ConfirmarPagoTarjetaRequest;
import com.tfg.sportshop.dto.pagos.PagoConfiguracionResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.tfg.sportshop.dto.pagos.ActualizarPagoEstadoRequest;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {
    private final PagoService pagoService;
    private final PagoConfiguracionService pagoConfiguracionService;

    public PagoController(PagoService pagoService, PagoConfiguracionService pagoConfiguracionService) {
        this.pagoService = pagoService;
        this.pagoConfiguracionService = pagoConfiguracionService;
    }

    @GetMapping("/configuracion")
    public ResponseEntity<PagoConfiguracionResponse> obtenerConfiguracionPago() {
        return ResponseEntity.ok(pagoConfiguracionService.obtenerConfiguracion());
    }

    @PostMapping
    public ResponseEntity<CrearPagoResponse> crearSesionPago(@Valid @RequestBody CrearPagoRequest request) {
        Usuario usuario = requireUsuario();
        return ResponseEntity.ok(pagoService.crearSesionStripe(request, usuario));
    }

    @PostMapping("/{idPago}/confirmar-mock")
    public ResponseEntity<Map<String, String>> confirmarPagoMock(@PathVariable Integer idPago) {
        Usuario usuario = requireUsuario();
        pagoService.confirmarPagoMock(idPago, usuario);
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @PostMapping("/{idPago}/confirmar-tarjeta")
    public ResponseEntity<Map<String, Object>> confirmarPagoTarjeta(
        @PathVariable Integer idPago,
        @Valid @RequestBody ConfirmarPagoTarjetaRequest request
    ) {
        Usuario usuario = requireUsuario();
        Pago pago = pagoService.confirmarPagoTarjeta(idPago, request.paymentIntentId(), usuario);
        return ResponseEntity.ok(Map.of(
            "idPago", pago.getIdPago(),
            "estado", pago.getEstado(),
            "fechaConfirmacion", pago.getFechaConfirmacion()
        ));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> stripeWebhook(
        @RequestBody String payload,
        @RequestHeader("Stripe-Signature") String stripeSignature
    ) {
        pagoService.procesarWebhookStripe(payload, stripeSignature);
        return ResponseEntity.ok(Map.of("received", "true"));
    }

    @PostMapping("/{idPago}/comprobante")
    public ResponseEntity<?> subirComprobante(
        @PathVariable Integer idPago,
        @RequestParam("file") MultipartFile file
    ) {
        Usuario usuario = requireUsuario();
        Pago pago = pagoService.subirComprobante(idPago, usuario, file);
        return ResponseEntity.ok(Map.of(
            "idPago", pago.getIdPago(),
            "estado", pago.getEstado(),
            "comprobanteUrl", pago.getComprobanteUrl(),
            "comprobanteNombreArchivo", pago.getComprobanteNombreArchivo()
        ));
    }

    @GetMapping("/{idPago}/comprobante")
    public ResponseEntity<Resource> descargarComprobante(@PathVariable Integer idPago) {
        Usuario usuario = requireUsuario();
        var descarga = pagoService.descargarComprobante(idPago, usuario);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + descarga.fileName() + "\"")
            .body(descarga.resource());
    }

    @PutMapping("/{idPago}/estado")
    public ResponseEntity<?> actualizarEstadoPago(
        @PathVariable Integer idPago,
        @Valid @RequestBody ActualizarPagoEstadoRequest request
    ) {
        requireAdmin();
        Pago pago = pagoService.actualizarEstadoPago(idPago, request.estado(), request.notasAdmin());
        return ResponseEntity.ok(Map.of(
            "idPago", pago.getIdPago(),
            "estado", pago.getEstado(),
            "fechaConfirmacion", pago.getFechaConfirmacion(),
            "notasAdmin", pago.getNotasAdmin()
        ));
    }

    private Usuario requireUsuario() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Usuario usuario)) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED,
                "Usuario no autenticado"
            );
        }
        return usuario;
    }

    private void requireAdmin() {
        Usuario usuario = requireUsuario();
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

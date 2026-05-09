package com.campusfp.uniformes.controller;

import com.campusfp.uniformes.services.PagoService;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    @Autowired
    private PagoService pagoService;

    @PostMapping("/crear-sesion/{idPedido}")
    public ResponseEntity<?> crearSesion(@PathVariable Integer idPedido) {
        try {
            Session session = pagoService.crearSesionStripe(idPedido);
            return ResponseEntity.ok(Map.of("url", session.getUrl(), "sessionId", session.getId()));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body("Error al crear sesion de pago");
        }
    }

    @PostMapping("/exito")
    public ResponseEntity<?> pagoExitoso(@RequestBody Map<String, String> payload) {
        String sessionId = payload.get("session_id");
        if (sessionId != null) {
            pagoService.procesarExito(sessionId);
            return ResponseEntity.ok("Pago procesado");
        }
        return ResponseEntity.badRequest().build();
    }
}

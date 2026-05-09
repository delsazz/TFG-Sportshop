package com.campusfp.uniformes.controller;

import com.campusfp.uniformes.model.Notificacion;
import com.campusfp.uniformes.services.NotificacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {
    @Autowired
    private NotificacionService notificacionService;

    @GetMapping
    public ResponseEntity<List<Notificacion>> getAllNotificaciones() {
        return ResponseEntity.ok(notificacionService.obtenerTodas());
    }
}

package com.campusfp.uniformes.controller;

import com.campusfp.uniformes.model.Usuario;
import com.campusfp.uniformes.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<Usuario>> getAllUsuarios() {
        return ResponseEntity.ok(usuarioService.verUsuarios());
    }

    @GetMapping("/{email}")
    public ResponseEntity<?> getUsuario(@PathVariable String email) {
        return usuarioService.buscarUsuarioPorEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

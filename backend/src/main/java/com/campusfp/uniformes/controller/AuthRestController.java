package com.campusfp.uniformes.controller;

import com.campusfp.uniformes.dto.LoginRequest;
import com.campusfp.uniformes.dto.LoginResponse;
import com.campusfp.uniformes.dto.RegisterRequest;
import com.campusfp.uniformes.dto.ResetPasswordRequest;
import com.campusfp.uniformes.dto.ForgotPasswordRequest;
import com.campusfp.uniformes.model.Usuario;
import com.campusfp.uniformes.security.JWTTokenProvider;
import com.campusfp.uniformes.services.AuthService;
import com.campusfp.uniformes.services.PasswordResetService;
import com.campusfp.uniformes.services.RegistroEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthRestController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JWTTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private RegistroEmailService registroEmailService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<Usuario> usuarioOpt = authService.autenticar(request.getEmail(), request.getPassword());

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            String token = jwtTokenProvider.generateToken(usuario.getCorreoElectronico());
            LoginResponse response = new LoginResponse(token, usuario.getCorreoElectronico(), usuario.getRol(), usuario.getNombre(), usuario.getApellidos());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body("Credenciales invalidas");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            Usuario usuario = authService.registrarUsuario(
                    request.getNombre(),
                    request.getApellidos(),
                    request.getEmail(),
                    request.getPassword(),
                    request.getTelefono(),
                    request.getDireccion(),
                    request.getNif(),
                    request.getCiudad(),
                    request.getPais(),
                    request.getCodigoPostal()
            );
            registroEmailService.enviarConfirmacionRegistro(usuario);
            return ResponseEntity.ok("Usuario registrado exitosamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        passwordResetService.solicitarRecuperacion(request.email());
        return ResponseEntity.ok("Si el correo existe, se ha enviado un enlace de recuperacion.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.restablecerPassword(request);
            return ResponseEntity.ok("Contrasena restablecida exitosamente.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

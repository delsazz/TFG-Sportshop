package com.tfg.sportshop.services;

import java.util.List;
import java.time.Instant;
import java.time.Duration;
import java.util.Optional;
import java.security.SecureRandom;
import com.tfg.sportshop.model.Usuario;
import org.springframework.stereotype.Service;
import com.tfg.sportshop.dto.ResetPasswordRequest;
import com.tfg.sportshop.model.PasswordResetToken;
import com.tfg.sportshop.repository.UsuarioRepository;
import org.springframework.transaction.annotation.Transactional;
import com.tfg.sportshop.repository.PasswordResetTokenRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class PasswordResetService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Duration TOKEN_TTL = Duration.ofMinutes(30);
    private static final String PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$";
    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(
            UsuarioRepository usuarioRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void solicitarRecuperacion(String email) {
        if(email == null || email.isBlank()) {
            return;
        }
        Optional<Usuario> usuario = usuarioRepository.findUsuarioByEmail(email.trim());
        if (usuario.isEmpty()) {
            return;
        }
        Instant ahora = Instant.now();
        tokenRepository.marcarTokensPendientesComoUsados(usuario.get(), ahora);
        String codigo = generarCodigo();
        PasswordResetToken token = new PasswordResetToken();
        token.setUsuario(usuario.get());
        token.setCodigoHash(passwordEncoder.encode(codigo));
        token.setFechaCreacion(ahora);
        token.setFechaExpiracion(ahora.plus(TOKEN_TTL));
        tokenRepository.save(token);
    }

    @Transactional
    public void restablecerPassword(ResetPasswordRequest request) {
        validarRequest(request);
        Usuario usuario = usuarioRepository.findUsuarioByEmail(request.email().trim())
                .orElseThrow(() -> new IllegalArgumentException("Codigo invalido o caducado"));
        Instant ahora = Instant.now();
        List<PasswordResetToken> tokens = tokenRepository
                .findByUsuarioAndFechaUsoIsNullAndFechaExpiracionAfterOrderByFechaCreacionDesc(usuario, ahora);
        PasswordResetToken tokenValido = tokens.stream()
                .filter(token -> passwordEncoder.matches(request.code().trim(), token.getCodigoHash()))
                .findFirst().orElseThrow(() -> new IllegalArgumentException("Codigo invalido o caducado"));
        usuario.setPassword(passwordEncoder.encode(request.newPassword()));
        usuarioRepository.save(usuario);
        tokenValido.setFechaUso(ahora);
        tokenRepository.marcarTokensPendientesComoUsados(usuario, ahora);
    }

    private void validarRequest(ResetPasswordRequest request) {
        if(request == null
                || request.email() == null
                || request.code() == null
                || request.newPassword() == null
                || request.confirmPassword() == null) {
            throw new IllegalArgumentException("Todos los campos son obligatorios");
        }

        if(!request.newPassword().equals(request.confirmPassword())) {
            throw new IllegalArgumentException("Las contrasenas no coinciden");
        }

        if(!request.newPassword().matches(PASSWORD_PATTERN)) {
            throw new IllegalArgumentException(
                    "La contrasena debe tener al menos 8 caracteres, una mayuscula, una minuscula y un numero"
            );
        }
    }

    private String generarCodigo() {
        return String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
    }
}

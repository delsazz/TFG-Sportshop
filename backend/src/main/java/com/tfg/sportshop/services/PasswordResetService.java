package com.tfg.sportshop.services;

import com.tfg.sportshop.dto.ResetPasswordRequest;
import com.tfg.sportshop.model.PasswordResetToken;
import com.tfg.sportshop.model.Usuario;
import com.tfg.sportshop.repository.PasswordResetTokenRepository;
import com.tfg.sportshop.repository.UsuarioRepository;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PasswordResetService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Duration TOKEN_TTL = Duration.ofMinutes(30);
    private static final String PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$";

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final boolean emailEnabled;
    private final String mailHost;
    private final String emailFrom;
    private final String frontendUrl;

    public PasswordResetService(
            UsuarioRepository usuarioRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.password-reset.email.enabled:true}") boolean emailEnabled,
            @Value("${spring.mail.host:}") String mailHost,
            @Value("${app.password-reset.email.from:${app.notifications.email.from:}}") String emailFrom,
            @Value("${app.frontend.url:http://localhost:5173}") String frontendUrl) {
        this.usuarioRepository = usuarioRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSenderProvider = mailSenderProvider;
        this.emailEnabled = emailEnabled;
        this.mailHost = mailHost;
        this.emailFrom = emailFrom;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public void solicitarRecuperacion(String email) {
        if (email == null || email.isBlank()) {
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

        enviarEmailRecuperacion(usuario.get(), codigo);
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
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Codigo invalido o caducado"));

        usuario.setPassword(passwordEncoder.encode(request.newPassword()));
        usuarioRepository.save(usuario);

        tokenValido.setFechaUso(ahora);
        tokenRepository.marcarTokensPendientesComoUsados(usuario, ahora);
    }

    private void validarRequest(ResetPasswordRequest request) {
        if (request == null
                || request.email() == null
                || request.code() == null
                || request.newPassword() == null
                || request.confirmPassword() == null) {
            throw new IllegalArgumentException("Todos los campos son obligatorios");
        }

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new IllegalArgumentException("Las contrasenas no coinciden");
        }

        if (!request.newPassword().matches(PASSWORD_PATTERN)) {
            throw new IllegalArgumentException(
                    "La contrasena debe tener al menos 8 caracteres, una mayuscula, una minuscula y un numero"
            );
        }
    }

    private String generarCodigo() {
        return String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
    }

    private void enviarEmailRecuperacion(Usuario usuario, String codigo) {
        if (!emailEnabled || mailHost == null || mailHost.isBlank()) {
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (emailFrom != null && !emailFrom.isBlank()) {
                message.setFrom(emailFrom);
            }
            message.setTo(usuario.getEmail());
            message.setSubject("Codigo para recuperar tu contrasena");
            message.setText(construirMensaje(usuario, codigo));
            mailSender.send(message);
        } catch (MailException ignored) {
            // El endpoint mantiene una respuesta generica para no filtrar informacion de cuentas.
        }
    }

    private String construirMensaje(Usuario usuario, String codigo) {
        String nombre = usuario.getNombre() == null || usuario.getNombre().isBlank()
                ? "usuario"
                : usuario.getNombre().trim();
        String emailParam = URLEncoder.encode(usuario.getEmail(), StandardCharsets.UTF_8);
        String enlace = frontendUrl.replaceAll("/+$", "") + "/recuperar-password?email=" + emailParam;

        return "Hola " + nombre + ",\n\n"
                + "Hemos recibido una solicitud para recuperar tu contrasena en CampusFP Uniformes.\n\n"
                + "Tu codigo de verificacion es: " + codigo + "\n"
                + "Este codigo caduca en 30 minutos.\n\n"
                + "Puedes crear una nueva contrasena desde este enlace:\n"
                + enlace + "\n\n"
                + "Si no has solicitado este cambio, ignora este mensaje.\n"
                + "Equipo de CampusFP Uniformes";
    }
}

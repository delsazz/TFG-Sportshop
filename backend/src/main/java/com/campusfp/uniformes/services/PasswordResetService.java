package com.campusfp.uniformes.services;

import com.campusfp.uniformes.dto.ResetPasswordRequest;
import com.campusfp.uniformes.model.PasswordResetToken;
import com.campusfp.uniformes.model.Usuario;
import com.campusfp.uniformes.repository.PasswordResetTokenRepository;
import com.campusfp.uniformes.repository.UsuarioRepository;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
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
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(email);
        if (usuarioOpt.isEmpty()) return;

        Usuario usuario = usuarioOpt.get();
        String codigo = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
        
        PasswordResetToken token = new PasswordResetToken();
        token.setUsuario(usuario);
        token.setToken(passwordEncoder.encode(codigo));
        token.setExpiryDate(LocalDateTime.now().plusMinutes(30));
        tokenRepository.save(token);

        enviarEmailRecuperacion(usuario, codigo);
    }

    @Transactional
    public void restablecerPassword(ResetPasswordRequest request) {
        Usuario usuario = usuarioRepository.findById(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
                
        usuario.setPw(passwordEncoder.encode(request.newPassword()));
        usuarioRepository.save(usuario);
    }

    private void enviarEmailRecuperacion(Usuario usuario, String codigo) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) return;
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (emailFrom != null && !emailFrom.isBlank()) {
                message.setFrom(emailFrom);
            }
            message.setTo(usuario.getCorreoElectronico());
            message.setSubject("Codigo para recuperar tu contrasena");
            message.setText("Tu codigo es: " + codigo);
            mailSender.send(message);
        } catch (MailException ignored) {}
    }
}

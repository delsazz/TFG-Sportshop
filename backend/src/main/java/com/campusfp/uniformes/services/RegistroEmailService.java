package com.campusfp.uniformes.services;

import com.campusfp.uniformes.model.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class RegistroEmailService {
    private static final Logger logger = LoggerFactory.getLogger(RegistroEmailService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final boolean emailEnabled;
    private final String mailHost;
    private final String emailFrom;

    public RegistroEmailService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.registration.email.enabled:true}") boolean emailEnabled,
            @Value("${spring.mail.host:}") String mailHost,
            @Value("${app.registration.email.from:${app.notifications.email.from:}}") String emailFrom) {
        this.mailSenderProvider = mailSenderProvider;
        this.emailEnabled = emailEnabled;
        this.mailHost = mailHost;
        this.emailFrom = emailFrom;
    }

    public void enviarConfirmacionRegistro(Usuario usuario) {
        if (usuario == null || usuario.getCorreoElectronico() == null || usuario.getCorreoElectronico().isBlank()) {
            logger.warn("No se pudo enviar el email de registro: usuario sin email");
            return;
        }

        if (!emailEnabled || mailHost == null || mailHost.isBlank()) {
            logger.info("Email de registro no enviado para {}: SMTP no configurado", usuario.getCorreoElectronico());
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            logger.warn("Email de registro no enviado para {}: JavaMailSender no disponible", usuario.getCorreoElectronico());
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (emailFrom != null && !emailFrom.isBlank()) {
                message.setFrom(emailFrom);
            }
            message.setTo(usuario.getCorreoElectronico());
            message.setSubject("Registro confirmado en Sportshop");
            message.setText(construirMensaje(usuario));
            mailSender.send(message);
            logger.info("Email de registro enviado a {}", usuario.getCorreoElectronico());
        } catch (MailException e) {
            logger.warn("No se pudo enviar el email de registro a {}: {}", usuario.getCorreoElectronico(), e.getMessage());
        }
    }

    private String construirMensaje(Usuario usuario) {
        String nombre = usuario.getNombre() == null || usuario.getNombre().isBlank()
                ? "usuario"
                : usuario.getNombre().trim();

        return "Hola " + nombre + ",\n\n"
                + "Tu registro en Sportshop se ha completado correctamente.\n\n"
                + "Gracias por registrarte.\n"
                + "Equipo de Sportshop";
    }
}

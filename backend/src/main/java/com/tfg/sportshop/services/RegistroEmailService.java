package com.tfg.sportshop.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.tfg.sportshop.model.Usuario;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Value;

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
        if(usuario == null || usuario.getEmail() == null || usuario.getEmail().isBlank()) {
            logger.warn("No se pudo enviar el email de registro: usuario sin email");
            return;
        }
        if(!emailEnabled || mailHost == null || mailHost.isBlank()) {
            logger.info("Email de registro no enviado para {}: SMTP no configurado", usuario.getEmail());
            return;
        }
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if(mailSender == null) {
            logger.warn("Email de registro no enviado para {}: JavaMailSender no disponible", usuario.getEmail());
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if(emailFrom != null && !emailFrom.isBlank()) {
                message.setFrom(emailFrom);
            }
            message.setTo(usuario.getEmail());
            message.setSubject("Registro confirmado en CampusFP Uniformes");
            message.setText(construirMensaje(usuario));
            mailSender.send(message);
            logger.info("Email de registro enviado a {}", usuario.getEmail());
        } catch (MailException e) {
            logger.warn("No se pudo enviar el email de registro a {}: {}", usuario.getEmail(), e.getMessage());
        }
    }

    private String construirMensaje(Usuario usuario) {
        String nombre = usuario.getNombre() == null || usuario.getNombre().isBlank()  ? "usuario" : usuario.getNombre().trim();
        return "Hola " + nombre + ",\n\n"
                + "Tu registro en Sportshop se ha completado correctamente.\n\n"
                + "Ya puedes iniciar sesion y gestionar tus pedidos de uniformes desde la plataforma.\n\n"
                + "Gracias por registrarte.\n"
                + "Equipo de Sporshop Uniformes";
    }
}
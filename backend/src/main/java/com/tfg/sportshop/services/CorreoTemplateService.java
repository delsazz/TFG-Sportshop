package com.tfg.sportshop.services;
import java.util.Map;
import org.slf4j.Logger;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.slf4j.LoggerFactory;
import com.tfg.sportshop.model.Pedido;
import com.tfg.sportshop.model.Usuario;
import java.time.format.DateTimeFormatter;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Value;
import com.tfg.sportshop.dto.configuracion.ConfiguracionSitioResponse;

@Service
public class CorreoTemplateService {
    private static final Logger logger = LoggerFactory.getLogger(CorreoTemplateService.class);
    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final int ERROR_EMAIL_MAX_LENGTH = 500;

    private final ConfiguracionSitioService configuracionSitioService;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final boolean emailEnabled;
    private final String mailHost;
    private final String emailFrom;

    public CorreoTemplateService(
            ConfiguracionSitioService configuracionSitioService,
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.notifications.email.enabled:true}") boolean emailEnabled,
            @Value("${spring.mail.host:}") String mailHost,
            @Value("${app.notifications.email.from:}") String emailFrom) {
        this.configuracionSitioService = configuracionSitioService;
        this.mailSenderProvider = mailSenderProvider;
        this.emailEnabled = emailEnabled;
        this.mailHost = mailHost;
        this.emailFrom = emailFrom;
    }

    public void enviarBienvenida(Usuario usuario) {
        if (usuario == null || usuario.getEmail() == null || usuario.getEmail().isBlank()) {
            return;
        }

        ConfiguracionSitioResponse config = configuracionSitioService.obtenerConfiguracion();
        enviarCorreo(
            usuario.getEmail(),
            renderizar(config.emailBienvenidaAsunto(), valoresUsuario(usuario)),
            renderizar(config.emailBienvenidaCuerpo(), valoresUsuario(usuario))
        );
    }

    public void enviarPedidoCreado(Pedido pedido) {
        if (pedido == null || pedido.getUsuario() == null || pedido.getUsuario().getEmail() == null || pedido.getUsuario().getEmail().isBlank()) {
            return;
        }

        ConfiguracionSitioResponse config = configuracionSitioService.obtenerConfiguracion();
        Map<String, String> valores = valoresPedido(pedido, null, pedido.getEstado());
        enviarCorreo(
            pedido.getUsuario().getEmail(),
            renderizar(config.emailPedidoCreadoAsunto(), valores),
            renderizar(config.emailPedidoCreadoCuerpo(), valores)
        );
    }

    public void enviarCambioEstadoPedido(Pedido pedido, String estadoAnterior, String estadoNuevo) {
        if (pedido == null || pedido.getUsuario() == null || pedido.getUsuario().getEmail() == null || pedido.getUsuario().getEmail().isBlank()) {
            return;
        }

        ConfiguracionSitioResponse config = configuracionSitioService.obtenerConfiguracion();
        Map<String, String> valores = valoresPedido(pedido, estadoAnterior, estadoNuevo);
        enviarCorreo(
            pedido.getUsuario().getEmail(),
            renderizar(config.emailCambioEstadoAsunto(), valores),
            renderizar(config.emailCambioEstadoCuerpo(), valores)
        );
    }

    public void enviarCambioPassword(Usuario usuario) {
        if (usuario == null || usuario.getEmail() == null || usuario.getEmail().isBlank()) {
            return;
        }

        ConfiguracionSitioResponse config = configuracionSitioService.obtenerConfiguracion();
        enviarCorreo(
            usuario.getEmail(),
            renderizar(config.emailCambioPasswordAsunto(), valoresUsuario(usuario)),
            renderizar(config.emailCambioPasswordCuerpo(), valoresUsuario(usuario))
        );
    }

    private void enviarCorreo(String destinatario, String asunto, String cuerpo) {
        if (!emailEnabled || mailHost == null || mailHost.isBlank()) {
            logger.info("Correo no enviado a {}: SMTP no configurado", destinatario);
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            logger.warn("Correo no enviado a {}: JavaMailSender no disponible", destinatario);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (emailFrom != null && !emailFrom.isBlank()) {
                message.setFrom(emailFrom);
            }
            message.setTo(destinatario);
            message.setSubject(normalizarTexto(asunto, "CampusFP Uniformes"));
            message.setText(normalizarTexto(cuerpo, ""));
            mailSender.send(message);
        } catch (MailException e) {
            logger.warn("No se pudo enviar el correo a {}: {}", destinatario, limitarLongitud(e.getMessage(), ERROR_EMAIL_MAX_LENGTH));
        }
    }

    private Map<String, String> valoresUsuario(Usuario usuario) {
        String nombre = normalizarTexto(usuario.getNombre(), "usuario");
        String apellidos = normalizarTexto(usuario.getApellidos(), "");
        String nombreCompleto = (nombre + " " + apellidos).trim();
        return Map.of(
            "usuario", nombreCompleto.isBlank() ? nombre : nombreCompleto,
            "nombre", nombre,
            "apellidos", apellidos,
            "email", normalizarTexto(usuario.getEmail(), "")
        );
    }

    private Map<String, String> valoresPedido(Pedido pedido, String estadoAnterior, String estadoNuevo) {
        Usuario usuario = pedido.getUsuario();
        Map<String, String> base = valoresUsuario(usuario);
        return Map.ofEntries(
            Map.entry("usuario", base.getOrDefault("usuario", "usuario")),
            Map.entry("nombre", base.getOrDefault("nombre", "usuario")),
            Map.entry("apellidos", base.getOrDefault("apellidos", "")),
            Map.entry("email", base.getOrDefault("email", "")),
            Map.entry("pedidoId", pedido.getIdPedido() == null ? "" : String.valueOf(pedido.getIdPedido())),
            Map.entry("estadoAnterior", normalizarTexto(estadoAnterior, "")),
            Map.entry("estadoNuevo", normalizarTexto(estadoNuevo, "")),
            Map.entry("total", formatearTotal(pedido.getTotal())),
            Map.entry("fecha", formatearFecha(pedido.getFecha()))
        );
    }

    private String renderizar(String plantilla, Map<String, String> valores) {
        String resultado = normalizarTexto(plantilla, "");
        for (Map.Entry<String, String> entry : valores.entrySet()) {
            resultado = resultado.replace("[" + entry.getKey() + "]", normalizarTexto(entry.getValue(), ""));
        }
        return resultado;
    }

    private String formatearFecha(LocalDateTime fecha) {
        return fecha == null ? "" : fecha.format(FECHA_FORMATTER);
    }

    private String formatearTotal(BigDecimal total) {
        return total == null ? "0.00" : total.toPlainString();
    }

    private String normalizarTexto(String valor, String fallback) {
        return valor == null || valor.isBlank() ? fallback : valor.trim();
    }

    private String limitarLongitud(String valor, int maxLength) {
        if (valor == null || valor.length() <= maxLength) {
            return valor;
        }
        return valor.substring(0, maxLength - 3) + "...";
    }
}
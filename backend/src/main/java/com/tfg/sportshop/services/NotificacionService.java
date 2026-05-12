package com.tfg.sportshop.services;

import java.util.List;
import java.time.LocalDateTime;
import com.tfg.sportshop.model.Pedido;
import org.springframework.http.HttpStatus;
import com.tfg.sportshop.model.Usuario;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;
import com.tfg.sportshop.model.Notificacion;
import com.tfg.sportshop.model.DetallePedido;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.server.ResponseStatusException;
import com.tfg.sportshop.repository.NotificacionRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificacionService {
    private static final String CANAL_APP = "APP";
    private static final int MENSAJE_MAX_LENGTH = 1000;
    private static final int ERROR_EMAIL_MAX_LENGTH = 500;

    private final NotificacionRepository notificacionRepository;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final boolean emailEnabled;
    private final String mailHost;
    private final String emailFrom;

    public NotificacionService(
            NotificacionRepository notificacionRepository,
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.notifications.email.enabled:true}") boolean emailEnabled,
            @Value("${spring.mail.host:}") String mailHost,
            @Value("${app.notifications.email.from:}") String emailFrom) {
        this.notificacionRepository = notificacionRepository;
        this.mailSenderProvider = mailSenderProvider;
        this.emailEnabled = emailEnabled;
        this.mailHost = mailHost;
        this.emailFrom = emailFrom;
    }

    @Transactional
    public Notificacion notificarCambioEstadoPedido(Pedido pedido, String estadoAnterior, String estadoNuevo) {
        if (pedido == null || pedido.getUsuario() == null || estadoNuevo == null || estadoNuevo.isBlank()) {
            return null;
        }

        Notificacion notificacion = new Notificacion();
        notificacion.setUsuario(pedido.getUsuario());
        notificacion.setPedido(pedido);
        notificacion.setCanal(CANAL_APP);
        notificacion.setTitulo("Tu pedido #" + pedido.getIdPedido() + " ha cambiado de estado");
        notificacion.setMensaje(construirMensaje(pedido, estadoAnterior, estadoNuevo));
        notificacion.setEstadoPedido(estadoNuevo);
        notificacion.setFechaEnvio(LocalDateTime.now());
        notificacion.setLeida(false);
        notificacion.setEmailDestinatario(pedido.getUsuario().getEmail());
        Notificacion guardada = notificacionRepository.save(notificacion);
        enviarEmailCambioEstado(guardada);
        return notificacionRepository.save(guardada);
    }

    @Transactional(readOnly = true)
    public List<Notificacion> buscarPorUsuario(Usuario usuario) {
        return notificacionRepository.findByUsuarioIdUsuarioOrderByFechaEnvioDesc(usuario.getIdUsuario());
    }

    @Transactional(readOnly = true)
    public long contarNoLeidas(Usuario usuario) {
        return notificacionRepository.countByUsuarioIdUsuarioAndLeidaFalse(usuario.getIdUsuario());
    }

    @Transactional
    public Notificacion marcarComoLeida(Integer idNotificacion, Usuario usuario) {
        Notificacion notificacion = notificacionRepository.findById(idNotificacion)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificacion no encontrada"));

        if (!notificacion.getUsuario().getIdUsuario().equals(usuario.getIdUsuario())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para modificar esta notificacion");
        }
        notificacion.setLeida(true);
        return notificacionRepository.save(notificacion);
    }

    private String construirMensaje(Pedido pedido, String estadoAnterior, String estadoNuevo) {
        StringBuilder mensaje = new StringBuilder();
        mensaje.append("Su pedido #").append(pedido.getIdPedido())
            .append(" ha cambiado de estado. Ahora se encuentra en estado ")
            .append(estadoNuevo).append(".");

        if (estadoAnterior != null && !estadoAnterior.isBlank()) {
            mensaje.append(" Estado anterior: ").append(estadoAnterior).append(".");
        }
        mensaje.append(" Total: ").append(pedido.getTotal()).append(" EUR.");

        if (pedido.getDetalles() != null && !pedido.getDetalles().isEmpty()) {
            mensaje.append(" Detalle: ");
            mensaje.append(pedido.getDetalles().stream()
                .map(this::resumirDetalle)
                .reduce((actual, siguiente) -> actual + "; " + siguiente)
                .orElse(""));
            mensaje.append(".");
        }
        return limitarLongitud(mensaje.toString(), MENSAJE_MAX_LENGTH);
    }

    private String resumirDetalle(DetallePedido detalle) {
        String producto = detalle.getProducto() == null ? "producto" : detalle.getProducto().getNombre();
        return detalle.getCantidad() + " x " + producto;
    }

    private void enviarEmailCambioEstado(Notificacion notificacion) {
        if (!emailEnabled || mailHost == null || mailHost.isBlank()) {
            notificacion.setErrorEmail("SMTP no configurado");
            return;
        }

        String destinatario = notificacion.getEmailDestinatario();
        if (destinatario == null || destinatario.isBlank()) {
            notificacion.setErrorEmail("El usuario no tiene email");
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            notificacion.setErrorEmail("JavaMailSender no disponible");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (emailFrom != null && !emailFrom.isBlank()) {
                message.setFrom(emailFrom);
            }
            message.setTo(destinatario);
            message.setSubject(notificacion.getTitulo());
            message.setText(notificacion.getMensaje());
            mailSender.send(message);
            notificacion.setEmailEnviado(true);
            notificacion.setFechaEmail(LocalDateTime.now());
            notificacion.setErrorEmail(null);
        } catch (MailException e) {
            notificacion.setEmailEnviado(false);
            notificacion.setErrorEmail(limitarLongitud(e.getMessage(), ERROR_EMAIL_MAX_LENGTH));
        }
    }

    private String limitarLongitud(String valor, int maxLength) {
        if (valor == null || valor.length() <= maxLength) {
            return valor;
        }
        return valor.substring(0, maxLength - 3) + "...";
    }
}

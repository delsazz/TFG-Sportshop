package com.tfg.sportshop.services;

import java.util.List;
import java.nio.file.Path;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.math.RoundingMode;
import java.nio.file.StandardCopyOption;

import com.stripe.model.Event;
import com.stripe.net.Webhook;
import com.tfg.sportshop.model.Pago;
import com.stripe.model.StripeObject;
import com.tfg.sportshop.model.Pedido;
import com.stripe.model.PaymentIntent;
import com.tfg.sportshop.model.Usuario;
import com.stripe.model.checkout.Session;
import org.springframework.http.HttpStatus;
import com.tfg.sportshop.model.EstadoPedido;
import com.stripe.exception.StripeException;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.core.io.PathResource;
import com.stripe.param.PaymentIntentCreateParams;
import com.tfg.sportshop.repository.PagoRepository;
import com.tfg.sportshop.dto.pagos.CrearPagoRequest;
import com.tfg.sportshop.dto.pagos.CrearPagoResponse;
import com.tfg.sportshop.repository.PedidoRepository;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import com.stripe.exception.SignatureVerificationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PagoService {
    @Autowired
    private PagoRepository pagoRepository;
    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private ConfiguracionSitioService configuracionSitioService;

    @Value("${app.upload.dir:uploads/productos}")
    private String uploadDir;
    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;
    @Value("${stripe.webhook.secret:}")
    private String stripeWebhookSecret;
    @Value("${stripe.checkout.success-url:http://localhost:5173/pagos/exito?session_id={CHECKOUT_SESSION_ID}}")
    private String defaultSuccessUrl;
    @Value("${stripe.checkout.cancel-url:http://localhost:5173/pagos/cancelado}")
    private String defaultCancelUrl;

    public List<Pago> buscarPagoPorPedido(int idPedido) {
        return pagoRepository.findByPedidoIdPedido(idPedido);
    }

    public List<Pago> buscarPagoPorEstado(String estado) {
        return pagoRepository.findByEstado(estado);
    }

    public List<Pago> buscarPagosPorMetodo(String metodoPago) {
        return pagoRepository.findByMetodoPago(metodoPago);
    }

    public List<Pago> buscarPagosPorFecha(LocalDate inicio, LocalDate fin) {
        return pagoRepository.findByFechaPagoBetween(inicio, fin);
    }

    @Transactional(readOnly = true)
    public Pago buscarPorId(Integer idPago) {
        return pagoRepository.findById(idPago)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pago no encontrado"));
    }

    @Transactional
    public CrearPagoResponse crearSesionStripe(CrearPagoRequest request, Usuario usuario) {
        boolean isMock = stripeSecretKey == null || stripeSecretKey.isBlank();
        configuracionSitioService.validarMetodoPagoHabilitado("tarjeta");
        Pedido pedido = pedidoRepository.findByIdWithRelations(request.getIdPedido())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
        validarAccesoPedido(pedido, usuario);
        if(EstadoPedido.PAGADO.getValor().equalsIgnoreCase(pedido.getEstado())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El pedido ya esta pagado");
        }
        var pagoPendiente = pagoRepository
            .findFirstByPedidoIdPedidoAndMetodoPagoAndEstadoOrderByIdPagoDesc(pedido.getIdPedido(), "tarjeta", "pendiente")
            .or(() -> pagoRepository.findFirstByPedidoIdPedidoAndMetodoPagoAndEstadoOrderByIdPagoDesc(
                pedido.getIdPedido(), "stripe", "pendiente"
            ))
            .or(() -> pagoRepository.findFirstByPedidoIdPedidoAndEstadoOrderByIdPagoDesc(pedido.getIdPedido(), "pendiente"));
        if(isMock && pagoPendiente.isPresent() && pagoPendiente.get().getStripeCheckoutUrl() != null) {
            return toCrearPagoResponse(pagoPendiente.get());
        }
        Pago pago = pagoPendiente.orElseGet(Pago::new);
        pago.setPedido(pedido);
        pago.setMetodoPago("tarjeta");
        pago.setFechaPago(pago.getFechaPago() == null ? LocalDate.now() : pago.getFechaPago());
        pago.setMonto(pedido.getTotal());
        pago.setEstado("pendiente");
        pago = pagoRepository.save(pago);
        if(isMock) {
            String mockUrl = String.format("/pago/mock?idPago=%d&successUrl=%s&cancelUrl=%s",
                pago.getIdPago(),
                valorUrl(request.getSuccessUrl(), defaultSuccessUrl),
                valorUrl(request.getCancelUrl(), defaultCancelUrl)
            );
            pago.setStripeCheckoutUrl(mockUrl);
            pago.setStripeSessionId("MOCK_SESSION_" + pago.getIdPago() + "_" + System.currentTimeMillis());
            pagoRepository.save(pago);
            return toCrearPagoResponse(pago);
        }

        try {
            long importeCentimos = pedido.getTotal().movePointRight(2).setScale(0, RoundingMode.HALF_UP)     
                .longValueExact();
            PaymentIntent intent;
            if(pago.getStripePaymentIntentId() != null && !pago.getStripePaymentIntentId().isBlank()) {
                intent = PaymentIntent.retrieve(pago.getStripePaymentIntentId());
            } else {
                PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(importeCentimos) .setCurrency("eur")
                    .setDescription("Pedido #" + pedido.getIdPedido() + " CampusFP Uniformes")
                    .putMetadata("idPedido", pedido.getIdPedido().toString())
                    .putMetadata("idPago", pago.getIdPago().toString())
                    .addPaymentMethodType("card").build();
                intent = PaymentIntent.create(params);
            }
            pago.setStripePaymentIntentId(intent.getId());
            pagoRepository.save(pago);
            return new CrearPagoResponse(
                pago.getIdPago(),
                pedido.getIdPedido(),
                pago.getEstado(),
                null,
                null,
                intent.getClientSecret()
            );
        } catch (StripeException | ArithmeticException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "No se pudo iniciar el pago con tarjeta en Stripe");
        }
    }

    @Transactional
    public void procesarWebhookStripe(String payload, String stripeSignature) {
        if(stripeWebhookSecret == null || stripeWebhookSecret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Webhook de Stripe no configurado");
        }
        Event event;
        try {
            event = Webhook.constructEvent(payload, stripeSignature, stripeWebhookSecret);
        } catch(SignatureVerificationException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Firma de Stripe no valida");
        }
        if(pagoRepository.findByStripeEventId(event.getId()).isPresent()) {
            return;
        }
        StripeObject stripeObject = event.getDataObjectDeserializer().getObject()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Evento de Stripe no soportado"));
        if("payment_intent.succeeded".equals(event.getType())) {
            if(!(stripeObject instanceof PaymentIntent intent)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Evento de Stripe no es un payment intent");
            }
            Pago pago = pagoRepository.findByStripePaymentIntentId(intent.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pago de Stripe no encontrado"));
            marcarPagoComoPagado(pago, event.getId(), intent.getId());
            return;
        }

        if(!"checkout.session.completed".equals(event.getType())
            && !"checkout.session.async_payment_succeeded".equals(event.getType())) {
            return;
        }

        if(!(stripeObject instanceof Session session)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Evento de Stripe no es una sesion de checkout");
        }

        if(!"paid".equalsIgnoreCase(session.getPaymentStatus())) {
            return;
        }
        Pago pago = pagoRepository.findByStripeSessionId(session.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pago de Stripe no encontrado"));
        marcarPagoComoPagado(pago, event.getId(), session.getPaymentIntent());
    }

    @Transactional
    public Pago subirComprobante(Integer idPago, Usuario usuario, MultipartFile file) {
        Pago pago = buscarPorId(idPago);
        validarAccesoPago(pago, usuario);
        if(file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo requerido");
        }
        try {
            Path pagosDir = Paths.get(uploadDir).getParent().resolve("pagos");
            Files.createDirectories(pagosDir);
            String fileName = "pago-" + idPago + "-" + System.currentTimeMillis() + "-" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_");
            Path destino = pagosDir.resolve(fileName);
            Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
            pago.setComprobanteUrl("/uploads/pagos/" + fileName);
            pago.setComprobanteNombreArchivo(file.getOriginalFilename());
            pago.setEstado("en_revision");
            return pagoRepository.save(pago);
        } catch(IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar el comprobante");
        }
    }

    @Transactional(readOnly = true)
    public DownloadedFile descargarComprobante(Integer idPago, Usuario usuario) {
        Pago pago = buscarPorId(idPago);
        validarAccesoPago(pago, usuario);
        if(pago.getComprobanteUrl() == null || pago.getComprobanteUrl().isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comprobante no disponible");
        }
        Path path = Paths.get("." + pago.getComprobanteUrl()).normalize();
        Resource resource = new PathResource(path);
        if(!resource.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Archivo no encontrado");
        }
        return new DownloadedFile(resource, pago.getComprobanteNombreArchivo() == null ? path.getFileName().toString() : pago.getComprobanteNombreArchivo());
    }

    @Transactional
    public Pago actualizarEstadoPago(Integer idPago, String estado, String notasAdmin) {
        Pago pago = buscarPorId(idPago);
        String estadoNormalizado = normalizarEstado(estado);
        pago.setEstado(estadoNormalizado);
        pago.setNotasAdmin(notasAdmin);
        if("pagado".equals(estadoNormalizado)) {
            pago.setFechaConfirmacion(LocalDate.now());
            Pedido pedido = pago.getPedido();
            if(pedido != null) {
                pedido.setEstadoEnum(EstadoPedido.PAGADO);
                pedidoRepository.save(pedido);
            }
        }
        return pagoRepository.save(pago);
    }

    @Transactional
    public Pago confirmarPagoTarjeta(Integer idPago, String paymentIntentId, Usuario usuario) {
        Pago pago = buscarPorId(idPago);
        validarAccesoPago(pago, usuario);
        if(paymentIntentId == null || paymentIntentId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment intent requerido");
        }
        if(pago.getStripePaymentIntentId() == null || !paymentIntentId.equals(pago.getStripePaymentIntentId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El payment intent no coincide con el pago");
        }

        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            if (!"succeeded".equalsIgnoreCase(intent.getStatus())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El pago todavia no ha sido confirmado por Stripe");
            }
            marcarPagoComoPagado(pago, pago.getStripeEventId(), paymentIntentId);
            return pagoRepository.save(pago);
        } catch (StripeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "No se pudo verificar el pago en Stripe");
        }
    }

    private void validarAccesoPago(Pago pago, Usuario usuario) {
        validarAccesoPedido(pago.getPedido(), usuario);
    }

    private void validarAccesoPedido(Pedido pedido, Usuario usuario) {
        boolean isAdmin = usuario.getRoles() != null && usuario.getRoles().stream()
            .anyMatch(rol -> "ADMIN".equalsIgnoreCase(rol.getNombreRol()));
        boolean isOwner = pedido != null  && pedido.getUsuario() != null
            && pedido.getUsuario().getIdUsuario().equals(usuario.getIdUsuario());
        if(!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos");
        }
    }

    private String valorUrl(String requestUrl, String defaultUrl) {
        return requestUrl == null || requestUrl.isBlank() ? defaultUrl : requestUrl;
    }

    private CrearPagoResponse toCrearPagoResponse(Pago pago) {
        return new CrearPagoResponse(
            pago.getIdPago(),
            pago.getPedido() == null ? null : pago.getPedido().getIdPedido(),
            pago.getEstado(),
            pago.getStripeSessionId(),
            pago.getStripeCheckoutUrl(),
            null
        );
    }

    private String normalizarEstado(String estado) {
        if(estado == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado requerido");
        }
        return switch (estado.trim().toLowerCase()) {
            case "pendiente" -> "pendiente";
            case "en_revision", "en revision" -> "en_revision";
            case "pagado", "confirmado" -> "pagado";
            case "rechazado" -> "rechazado";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado no valido");
        };
    }

    @Transactional
    public void confirmarPagoMock(Integer idPago, Usuario usuario) {
        Pago pago = buscarPorId(idPago);
        validarAccesoPago(pago, usuario);
        if(!pago.getStripeSessionId().startsWith("MOCK_SESSION_")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este pago no es un pago simulado");
        }
        if(!"pagado".equalsIgnoreCase(pago.getEstado())) {
            pago.setEstado("pagado");
            pago.setFechaConfirmacion(LocalDate.now());
            pago.setStripeEventId("MOCK_EVENT_" + System.currentTimeMillis());
            Pedido pedido = pago.getPedido();
            if(pedido != null) {
                pedido.setEstadoEnum(EstadoPedido.PAGADO);
                pedidoRepository.save(pedido);
            }
        }
        pagoRepository.save(pago);
    }

    private void marcarPagoComoPagado(Pago pago, String eventId, String paymentIntentId) {
        pago.setStripeEventId(eventId);
        pago.setStripePaymentIntentId(paymentIntentId);
        if(!"pagado".equalsIgnoreCase(pago.getEstado())) {
            pago.setEstado("pagado");
            pago.setFechaConfirmacion(LocalDate.now());
            Pedido pedido = pago.getPedido();
            if(pedido != null) {
                pedido.setEstadoEnum(EstadoPedido.PAGADO);
                pedidoRepository.save(pedido);
            }
        }
        pagoRepository.save(pago);
    }

    public record DownloadedFile(Resource resource, String fileName) {
    }
}
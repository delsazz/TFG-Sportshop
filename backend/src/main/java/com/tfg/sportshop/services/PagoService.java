package com.tfg.sportshop.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.tfg.sportshop.dto.pagos.CrearPagoRequest;
import com.tfg.sportshop.dto.pagos.CrearPagoResponse;
import com.tfg.sportshop.model.EstadoPedido;
import com.tfg.sportshop.model.Pago;
import com.tfg.sportshop.model.Pedido;
import com.tfg.sportshop.model.Usuario;
import com.tfg.sportshop.repository.PagoRepository;
import com.tfg.sportshop.repository.PedidoRepository;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PagoService {
    private final PagoRepository pagoRepository;
    private final PedidoRepository pedidoRepository;
    private final ConfiguracionSitioService configuracionSitioService;
    private final PedidoService pedidoService;

    public PagoService(
        PagoRepository pagoRepository,
        PedidoRepository pedidoRepository,
        ConfiguracionSitioService configuracionSitioService,
        PedidoService pedidoService
    ) {
        this.pagoRepository = pagoRepository;
        this.pedidoRepository = pedidoRepository;
        this.configuracionSitioService = configuracionSitioService;
        this.pedidoService = pedidoService;
    }

    public List<Pago> buscarPagoPorPedido(int idPedido) {
        return pagoRepository.findByPedidoIdPedido(idPedido);
    }

    public List<Pago> buscarPagoPorEstado(String estado) {
        return pagoRepository.findByEstado(estado);
    }

    public List<Pago> buscarPagosPorMetodo(String metodoPago) {
        return pagoRepository.findAll();
    }

    public List<Pago> buscarPagosPorFecha(LocalDate inicio, LocalDate fin) {
        LocalDateTime desde = inicio == null ? LocalDate.MIN.atStartOfDay() : inicio.atStartOfDay();
        LocalDateTime hasta = fin == null ? LocalDate.MAX.atTime(23, 59, 59) : fin.atTime(23, 59, 59);
        return pagoRepository.findByFechaPagoBetween(desde, hasta);
    }

    @Transactional(readOnly = true)
    public Pago buscarPorId(Integer idPago) {
        return pagoRepository.findById(idPago)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pago no encontrado"));
    }

    @Transactional
    public CrearPagoResponse crearPago(CrearPagoRequest request, Usuario usuario) {
        configuracionSitioService.validarMetodoPagoHabilitado("tarjeta");
        Pedido pedido = pedidoRepository.findByIdWithRelations(request.getIdPedido())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
        validarAccesoPedido(pedido, usuario);
        if(EstadoPedido.PAGADO.getValor().equalsIgnoreCase(pedido.getEstado())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El pedido ya esta pagado");
        }

        Pago pago = pagoRepository
            .findFirstByPedidoIdPedidoAndEstadoOrderByIdPagoDesc(pedido.getIdPedido(), "pendiente")
            .orElseGet(Pago::new);
        pago.setPedido(pedido);
        pago.setFechaPago(pago.getFechaPago() == null ? LocalDateTime.now() : pago.getFechaPago());
        pago.setMonto(pedido.getTotal());
        pago.setEstado("pendiente");
        pago = pagoRepository.save(pago);
        return new CrearPagoResponse(
            pago.getIdPago(),
            pedido.getIdPedido(),
            pago.getEstado(),
            null,
            null,
            null
        );
    }

    @Transactional
    public Pago subirComprobante(Integer idPago, Usuario usuario, MultipartFile file) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "El script SQL no contempla comprobantes de pago");
    }

    @Transactional(readOnly = true)
    public DownloadedFile descargarComprobante(Integer idPago, Usuario usuario) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "El script SQL no contempla comprobantes de pago");
    }

    @Transactional
    public Pago actualizarEstadoPago(Integer idPago, String estado, String notasAdmin) {
        Pago pago = buscarPorId(idPago);
        pago.setEstado(normalizarEstado(estado));
        if("pagado".equalsIgnoreCase(pago.getEstado())) {
            marcarPagoComoPagado(pago);
        }
        return pagoRepository.save(pago);
    }

    @Transactional
    public Pago confirmarPagoTarjeta(Integer idPago, String paymentIntentId, Usuario usuario) {
        Pago pago = buscarPorId(idPago);
        validarAccesoPago(pago, usuario);
        marcarPagoComoPagado(pago);
        return pagoRepository.save(pago);
    }

    @Transactional
    public void confirmarPagoMock(Integer idPago, Usuario usuario) {
        Pago pago = buscarPorId(idPago);
        validarAccesoPago(pago, usuario);
        marcarPagoComoPagado(pago);
        pagoRepository.save(pago);
    }

    private void validarAccesoPago(Pago pago, Usuario usuario) {
        validarAccesoPedido(pago.getPedido(), usuario);
    }

    private void validarAccesoPedido(Pedido pedido, Usuario usuario) {
        boolean isAdmin = usuario.getRoles() != null && usuario.getRoles().stream()
            .anyMatch(rol -> "ADMIN".equalsIgnoreCase(rol.getNombreRol()));
        boolean isOwner = pedido != null && pedido.getUsuario() != null
            && pedido.getUsuario().getIdUsuario().equals(usuario.getIdUsuario());
        if(!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos");
        }
    }

    private void marcarPagoComoPagado(Pago pago) {
        pago.setEstado("pagado");
        Pedido pedido = pago.getPedido();
        if(pedido != null) {
            pedidoService.marcarComoPagadoPorPago(pedido.getIdPedido().longValue());
        }
    }

    private String normalizarEstado(String estado) {
        if(estado == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado requerido");
        }
        return switch (estado.trim().toLowerCase()) {
            case "pendiente" -> "pendiente";
            case "pagado", "confirmado" -> "pagado";
            case "rechazado" -> "rechazado";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado no valido");
        };
    }

    public record DownloadedFile(Resource resource, String fileName) {
    }
}

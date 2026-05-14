package com.tfg.sportshop.services;

import java.util.Map;
import java.util.List;
import java.util.HashMap;
import java.util.ArrayList;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.hibernate.Hibernate;
import com.tfg.sportshop.model.Pago;
import com.tfg.sportshop.model.Talla;
import com.tfg.sportshop.model.Pedido;
import com.tfg.sportshop.model.Usuario;
import com.tfg.sportshop.model.Producto;
import org.springframework.http.HttpStatus;
import com.tfg.sportshop.model.EstadoPedido;
import com.tfg.sportshop.model.DetallePedido;
import com.tfg.sportshop.model.PedidoEntrega;
import com.tfg.sportshop.model.ProductoTalla;
import org.springframework.stereotype.Service;
import com.tfg.sportshop.model.PedidoHistorial;
import com.tfg.sportshop.model.EstadoEntregaLinea;
import com.tfg.sportshop.model.PedidoEntregaLinea;
import com.tfg.sportshop.repository.PagoRepository;
import com.tfg.sportshop.repository.TallaRepository;
import com.tfg.sportshop.repository.PedidoRepository;
import com.tfg.sportshop.dto.admin.CrearPedidoRequest;
import com.tfg.sportshop.repository.UsuarioRepository;
import com.tfg.sportshop.repository.ProductoRepository;
import com.tfg.sportshop.dto.admin.CrearPedidoItemRequest;
import com.tfg.sportshop.repository.DetallePedidoRepository;
import com.tfg.sportshop.repository.PedidoEntregaRepository;
import com.tfg.sportshop.repository.ProductoTallaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;
import com.tfg.sportshop.repository.PedidoHistorialRepository;
import org.springframework.transaction.annotation.Transactional;
import com.tfg.sportshop.dto.admin.RegistrarEntregaLineaRequest;
import com.tfg.sportshop.dto.admin.RegistrarEntregaPedidoRequest;
import com.tfg.sportshop.repository.PedidoEntregaLineaRepository;
import com.tfg.sportshop.dto.admin.ActualizarEntregasPedidoRequest;

@Service
public class PedidoService {
    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private PedidoHistorialRepository pedidoHistorialRepository;
    @Autowired
    private DetallePedidoRepository detallePedidoRepository;
    @Autowired
    private PedidoEntregaRepository pedidoEntregaRepository;
    @Autowired
    private PedidoEntregaLineaRepository pedidoEntregaLineaRepository;
    @Autowired
    private PagoRepository pagoRepository;
    @Autowired
    private ConfiguracionSitioService configuracionSitioService;
    @Autowired
    private ProductoRepository productoRepository;
    @Autowired
    private ProductoTallaRepository productoTallaRepository;
    @Autowired
    private TallaRepository tallaRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private NotificacionService notificacionService;
    @Autowired
    private BackorderPedidoService backorderPedidoService;

    @Transactional(readOnly = true)
    public List<Pedido> verPedidos() {
        return pedidoRepository.findAllWithRelations();
    }

    @Transactional(readOnly = true)
    public Pedido buscarPedidoPorId(Long id) {
        Pedido pedido = pedidoRepository.findByIdWithRelations(id.intValue())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
        Hibernate.initialize(pedido.getPagos());
        return pedido;
    }

    @Transactional(readOnly = true)
    public List<Pedido> buscarPedidosPorUsuario(Integer idUsuario) {
        return pedidoRepository.findByUsuarioIdUsuarioOrderByFechaDesc(idUsuario);
    }

    @Transactional
    public Pedido crearPedido(Usuario usuario, CrearPedidoRequest request) {
        Usuario usuarioPersistido = obtenerUsuarioExistente(usuario.getIdUsuario());
        PedidoDraft draft = construirPedidoDraft(request);
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuarioPersistido);
        pedido.setFecha(LocalDateTime.now());
        pedido.setTotal(draft.total());
        pedido.setEstadoEnum(EstadoPedido.PENDIENTE);
        Pedido pedidoGuardado = pedidoRepository.save(pedido);
        for(DetallePedido detalle : draft.detalles()) {
            detalle.setPedido(pedidoGuardado);
        }
        detallePedidoRepository.saveAll(draft.detalles());
        pedidoGuardado.setDetalles(draft.detalles());
        aplicarStock(draft.detalles(), -1);
        registrarBackorders(pedidoGuardado, draft.detalles());
        registrarPagoInicial(pedidoGuardado, request.metodoPago());
        String descripcion = draft.parcial() ? "Pedido creado parcialmente por usuario" : "Pedido creado por usuario";
        registrarHistorial(pedidoGuardado, "CREACION", null, "PENDIENTE", descripcion);
        return buscarPedidoPorId(pedidoGuardado.getIdPedido().longValue());
    }

    @Transactional
    public Pedido actualizarPedidoAdmin(Long id, Integer idUsuario, String estado, CrearPedidoRequest request) {
        Pedido pedido = buscarPedidoPorId(id);
        if(pedidoEntregaLineaRepository.existsByPedidoId(pedido.getIdPedido())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede editar un pedido con entregas registradas");
        }
        Usuario usuarioPersistido = obtenerUsuarioExistente(idUsuario);
        PedidoDraft draft = construirPedidoDraft(request);
        List<DetallePedido> detallesActuales = detallePedidoRepository.findByPedidoIdPedido(pedido.getIdPedido());
        String estadoAnterior = pedido.getEstado();
        aplicarStock(detallesActuales, 1);
        backorderPedidoService.eliminarPorPedido(pedido.getIdPedido());
        detallePedidoRepository.deleteAll(detallesActuales);
        try {
            pedido.setEstadoEnum(EstadoPedido.fromValor(estado));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado no valido: " + estado);
        }
        pedido.setUsuario(usuarioPersistido);
        pedido.setTotal(draft.total());
        Pedido pedidoActualizado = pedidoRepository.save(pedido);
        for(DetallePedido detalle : draft.detalles()) {
            detalle.setPedido(pedidoActualizado);
        }
        detallePedidoRepository.saveAll(draft.detalles());
        pedidoActualizado.setDetalles(draft.detalles());
        aplicarStock(draft.detalles(), -1);
        registrarBackorders(pedidoActualizado, draft.detalles());
        registrarHistorial(
            pedidoActualizado,
            "EDICION_PEDIDO",
            estadoAnterior,
            pedidoActualizado.getEstado(),
            "Pedido editado manualmente desde el panel de administracion"
        );
        notificarCambioEstadoSiAplica(pedidoActualizado, estadoAnterior, pedidoActualizado.getEstado());
        return buscarPedidoPorId(pedidoActualizado.getIdPedido().longValue());
    }

    @Transactional
    public Pedido actualizarEstado(Long id, String estado) {
        Pedido pedido = buscarPedidoPorId(id);
        String estadoAnterior = pedido.getEstado();
        if(estadoAnterior != null && estadoAnterior.equals(estado)) {
            return pedido;
        }
        try {
            EstadoPedido nuevoEstado = EstadoPedido.fromValor(estado);
            if(nuevoEstado == EstadoPedido.ENTREGADO_COMPLETO && !tieneFirmaRecepcion(pedido.getIdPedido())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Debes registrar la firma de recepcion antes de marcar el pedido como entregado completo");
            }
            if(!pedido.esTransicionValida(nuevoEstado)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Transicion no valida de " + pedido.getEstado() + " a " + estado);
            }
            pedido.setEstadoEnum(nuevoEstado);
        } catch(IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado no valido: " + estado);
        }
        Pedido actualizado = pedidoRepository.save(pedido);
        registrarHistorial(actualizado, "CAMBIO_ESTADO", estadoAnterior, estado, "Estado actualizado manualmente desde el panel de administracion");
        notificacionService.notificarCambioEstadoPedido(actualizado, estadoAnterior, actualizado.getEstado());
        return actualizado;
    }

    @Transactional
    public Pedido registrarEntrega(Long id, RegistrarEntregaPedidoRequest request) {
        Pedido pedido = buscarPedidoPorId(id);
        Map<Integer, DetallePedido> detallesPorId = new HashMap<>();
        for(DetallePedido detalle : pedido.getDetalles()) {
            detallesPorId.put(detalle.getIdDetalle(), detalle);
        }
        Map<Integer, Integer> cantidadesEntregadas = obtenerCantidadesEntregadas(pedido.getIdPedido());
        String firmaGuardada = obtenerFirmaRecepcionGuardada(
            pedidoEntregaRepository.findByPedidoIdPedidoOrderByFechaEntregaDesc(pedido.getIdPedido())
        );
        PedidoEntrega entrega = new PedidoEntrega();
        entrega.setPedido(pedido);
        entrega.setFechaEntrega(LocalDateTime.now());
        aplicarDatosRecepcion(entrega, request.comprobanteEntregaUrl(), request.comprobanteEntregaNombreArchivo(),
            firmaGuardada == null ? request.firmaRecepcion() : firmaGuardada,
            request.nombreRecibe(), request.documentoRecibe(), request.observaciones());
        List<PedidoEntregaLinea> lineasEntrega = new ArrayList<>();
        for (RegistrarEntregaLineaRequest lineaRequest : request.lineas()) {
            DetallePedido detalle = detallesPorId.get(lineaRequest.idDetalle());
            if(detalle == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La linea seleccionada no pertenece al pedido");
            }
            int entregado = cantidadesEntregadas.getOrDefault(detalle.getIdDetalle(), 0);
            int pendiente = detalle.getCantidad() - entregado;
            if (lineaRequest.cantidad() > pendiente) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La cantidad entregada supera la cantidad pendiente");
            }
            PedidoEntregaLinea linea = new PedidoEntregaLinea();
            linea.setEntrega(entrega);
            linea.setDetalle(detalle);
            linea.setCantidad(lineaRequest.cantidad());
            linea.setEstadoEntrega(lineaRequest.cantidad() >= pendiente ? EstadoEntregaLinea.ENTREGADA.name() : EstadoEntregaLinea.EN_REPARTO.name());
            lineasEntrega.add(linea);
            String descripcion = "Entrega registrada: " + lineaRequest.cantidad() + " ud. de " + (detalle.getProducto() != null ? detalle.getProducto().getNombre() : "producto");
            registrarHistorial(pedido, "ENTREGA_REGISTRADA", null, null, descripcion);
        }
        if(entregaCompletaTrasEntrega(pedido, cantidadesEntregadas, request.lineas()) && entrega.getFirmaRecepcion() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Debes registrar la firma de recepcion antes de marcar el pedido como entregado completo");
        }
        entrega.setLineas(lineasEntrega);
        pedidoEntregaRepository.save(entrega);
        actualizarEstadoTrasEntrega(pedido, cantidadesEntregadas, request.lineas());
        return buscarPedidoPorId(id);
    }

    @Transactional
    public Pedido actualizarEntregas(Long id, ActualizarEntregasPedidoRequest request) {
        Pedido pedido = buscarPedidoPorId(id);
        Map<Integer, DetallePedido> detallesPorId = new HashMap<>();
        for(DetallePedido detalle : pedido.getDetalles()) {
            detallesPorId.put(detalle.getIdDetalle(), detalle);
        }
        List<PedidoEntrega> entregasPrevias = pedidoEntregaRepository.findByPedidoIdPedidoOrderByFechaEntregaDesc(pedido.getIdPedido());
        String firmaGuardada = obtenerFirmaRecepcionGuardada(entregasPrevias);
        if(!entregasPrevias.isEmpty()) {
            pedidoEntregaRepository.deleteAll(entregasPrevias);
        }
        Map<Integer, Integer> cantidadesEntregadas = new HashMap<>();
        PedidoEntrega entrega = new PedidoEntrega();
        entrega.setPedido(pedido);
        entrega.setFechaEntrega(LocalDateTime.now());
        aplicarDatosRecepcion(entrega, request.comprobanteEntregaUrl(), request.comprobanteEntregaNombreArchivo(),
            firmaGuardada == null ? request.firmaRecepcion() : firmaGuardada,
            request.nombreRecibe(), request.documentoRecibe(), request.observaciones());
        List<PedidoEntregaLinea> lineasEntrega = new ArrayList<>();
        for (AtualizarEntregasPedidoRequest.ActualizarEntregaLineaRequest lineaRequest : request.lineas()) {
            DetallePedido detalle = detallesPorId.get(lineaRequest.idDetalle());
            if(detalle == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La linea seleccionada no pertenece al pedido");
            }
            EstadoEntregaLinea estadoLinea = EstadoEntregaLinea.fromValor(lineaRequest.estadoEntrega());
            int cantidadPedida = detalle.getCantidad() == null ? 0 : detalle.getCantidad();
            int cantidadEntregada = lineaRequest.cantidadEntregada() == null ? 0 : lineaRequest.cantidadEntregada();
            if(estadoLinea == EstadoEntregaLinea.SIN_ENTREGAR) {
                cantidadEntregada = 0;
            } else if(estadoLinea == EstadoEntregaLinea.ENTREGADA) {
                cantidadEntregada = cantidadPedida;
            } else if(cantidadEntregada <= 0 && cantidadPedida > 0) {
                cantidadEntregada = 1;
            }
            if(cantidadEntregada < 0 || cantidadEntregada > cantidadPedida) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La cantidad entregada supera la cantidad pedida");
            }
            if(estadoLinea == EstadoEntregaLinea.EN_REPARTO && cantidadPedida <= 1) {
                cantidadEntregada = 0;
                estadoLinea = EstadoEntregaLinea.SIN_ENTREGAR;
            } else if(estadoLinea == EstadoEntregaLinea.EN_REPARTO && cantidadEntregada >= cantidadPedida) {
                cantidadEntregada = Math.max(cantidadPedida - 1, 0);
            }
            cantidadesEntregadas.put(detalle.getIdDetalle(), cantidadEntregada);
            if(cantidadEntregada <= 0) {
                continue;
            }
            PedidoEntregaLinea linea = new PedidoEntregaLinea();
            linea.setEntrega(entrega);
            linea.setDetalle(detalle);
            linea.setCantidad(cantidadEntregada);
            linea.setEstadoEntrega(estadoLinea.name());
            lineasEntrega.add(linea);
        }
        if(!lineasEntrega.isEmpty()) {
            entrega.setLineas(lineasEntrega);
            pedidoEntregaRepository.save(entrega);
        }
        String estadoAnterior = pedido.getEstado();
        boolean completo = true;
        boolean algunaEntregada = false;
        for(DetallePedido detalle : pedido.getDetalles()) {
            int cantidadPedida = detalle.getCantidad() == null ? 0 : detalle.getCantidad();
            int cantidadEntregada = cantidadesEntregadas.getOrDefault(detalle.getIdDetalle(), 0);
            if(cantidadEntregada > 0) {
                algunaEntregada = true;
            }
            if(cantidadEntregada < cantidadPedida) {
                completo = false;
            }
        }

        if(completo && algunaEntregada && entrega.getFirmaRecepcion() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Debes registrar la firma de recepcion antes de marcar el pedido como entregado completo");
        }

        if(completo && algunaEntregada) {
            pedido.setEstadoEnum(EstadoPedido.ENTREGADO_COMPLETO);
        } else if(algunaEntregada) {
            pedido.setEstadoEnum(EstadoPedido.ENTREGADO_PARCIAL);
        } else {
            pedido.setEstadoEnum(EstadoPedido.PAGADO);
        }
        Pedido pedidoActualizado = pedidoRepository.save(pedido);
        registrarHistorial(
                pedidoActualizado,
                "ENTREGAS_ACTUALIZADAS",
                estadoAnterior,
                pedidoActualizado.getEstado(),
                "Entregas por prenda actualizadas manualmente desde el panel de administracion"
        );

        if(!pedidoActualizado.getEstado().equals(estadoAnterior)) {
            notificacionService.notificarCambioEstadoPedido(pedidoActualizado, estadoAnterior, pedidoActualizado.getEstado());
        }
        return buscarPedidoPorId(id);
    }

    @Transactional
    public Pedido deshacerEntrega(Long idPedido, Integer idEntrega) {
        Pedido pedido = buscarPedidoPorId(idPedido);
        PedidoEntrega entrega = pedidoEntregaRepository.findById(idEntrega)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrega no encontrada"));
        if(!entrega.getPedido().getIdPedido().equals(pedido.getIdPedido())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La entrega no pertenece al pedido");
        }
        String descripcion = "Entrega #" + idEntrega + " eliminada";
        registrarHistorial(pedido, "ENTREGA_ELIMINADA", null, null, descripcion);
        pedidoEntregaRepository.delete(entrega);
        
        // Re-evaluar estado del pedido
        Map<Integer, Integer> cantidadesRestantes = obtenerCantidadesEntregadas(pedido.getIdPedido());
        int totalPedidas = pedido.getDetalles().stream().mapToInt(DetallePedido::getCantidad).sum();
        int totalEntregadas = cantidadesRestantes.values().stream().mapToInt(Integer::intValue).sum();
        String estadoAnterior = pedido.getEstado();
        if(totalEntregadas == 0) {
            pedido.setEstadoEnum(EstadoPedido.PAGADO); 
        } else if(totalEntregadas < totalPedidas) {
            pedido.setEstadoEnum(EstadoPedido.ENTREGADO_PARCIAL);
        }
        if(!pedido.getEstado().equals(estadoAnterior)) {
            registrarHistorial(pedido, "CAMBIO_ESTADO", estadoAnterior, pedido.getEstado(), "Estado revertido tras eliminar entrega");
            notificacionService.notificarCambioEstadoPedido(pedido, estadoAnterior, pedido.getEstado());
        }
        pedidoRepository.save(pedido);
        return buscarPedidoPorId(idPedido);
    }

    private void actualizarEstadoTrasEntrega(Pedido pedido, Map<Integer, Integer> actuales, List<RegistrarEntregaLineaRequest> nuevas) {
        Map<Integer, Integer> totales = new HashMap<>(actuales);
        for(RegistrarEntregaLineaRequest n : nuevas) {
            totales.merge(n.idDetalle(), n.cantidad(), Integer::sum);
        }
        boolean completo = true;
        boolean alguna = false;
        for(DetallePedido d : pedido.getDetalles()) {
            int ent = totales.getOrDefault(d.getIdDetalle(), 0);
            if(ent < d.getCantidad()) completo = false;
            if(ent > 0) alguna = true;
        }
        String estadoAnterior = pedido.getEstado();
        if(completo) {
            pedido.setEstadoEnum(EstadoPedido.ENTREGADO_COMPLETO);
        } else if (alguna) {
            pedido.setEstadoEnum(EstadoPedido.ENTREGADO_PARCIAL);
        }
        if(!pedido.getEstado().equals(estadoAnterior)) {
            registrarHistorial(pedido, "CAMBIO_ESTADO", estadoAnterior, pedido.getEstado(), "Estado actualizado tras registro de entrega");
            pedidoRepository.save(pedido);
            notificacionService.notificarCambioEstadoPedido(pedido, estadoAnterior, pedido.getEstado());
        }
    }

    private boolean entregaCompletaTrasEntrega(Pedido pedido, Map<Integer, Integer> actuales, List<RegistrarEntregaLineaRequest> nuevas) {
        Map<Integer, Integer> totales = new HashMap<>(actuales);
        for(RegistrarEntregaLineaRequest n : nuevas) {
            totales.merge(n.idDetalle(), n.cantidad(), Integer::sum);
        }
        for(DetallePedido detalle : pedido.getDetalles()) {
            int cantidadPedida = detalle.getCantidad() == null ? 0 : detalle.getCantidad();
            int cantidadEntregada = totales.getOrDefault(detalle.getIdDetalle(), 0);
            if(cantidadEntregada < cantidadPedida) {
                return false;
            }
        }
        return !pedido.getDetalles().isEmpty();
    }

    @Transactional(readOnly = true)
    public List<PedidoHistorial> verHistorial(Long id) {
        return pedidoHistorialRepository.findByPedidoIdPedidoOrderByFechaCambioDesc(id.intValue());
    }

    @Transactional(readOnly = true)
    public Map<Integer, Integer> obtenerCantidadesEntregadas(Integer pedidoId) {
        Map<Integer, Integer> cantidades = new HashMap<>();
        for(Object[] fila : pedidoEntregaLineaRepository.sumEntregadoPorPedido(pedidoId)) {
            cantidades.put((Integer) fila[0], ((Long) fila[1]).intValue());
        }
        return cantidades;
    }

    @Transactional(readOnly = true)
    public Map<Integer, String> obtenerEstadosEntrega(Integer pedidoId) {
        Map<Integer, String> estados = new HashMap<>();
        List<PedidoEntrega> entregas = pedidoEntregaRepository.findByPedidoIdPedidoOrderByFechaEntregaDesc(pedidoId);
        for(PedidoEntrega entrega : entregas) {
            if(entrega.getLineas() == null) {
                continue;
            }
            for(PedidoEntregaLinea linea : entrega.getLineas()) {
                Integer idDetalle = linea.getDetalle() == null ? null : linea.getDetalle().getIdDetalle();
                if(idDetalle != null && !estados.containsKey(idDetalle)) {
                    estados.put(idDetalle, linea.getEstadoEntrega() == null ? EstadoEntregaLinea.SIN_ENTREGAR.name() : linea.getEstadoEntrega());
                }
            }
        }
        return estados;
    }

    @Transactional(readOnly = true)
    public List<PedidoEntrega> verEntregas(Integer pedidoId) {
        return pedidoEntregaRepository.findByPedidoIdPedidoOrderByFechaEntregaDesc(pedidoId);
    }

    private Usuario obtenerUsuarioExistente(Integer idUsuario) {
        if(idUsuario == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El usuario es requerido");
        }
        return usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuario no encontrado"));
    }

    private PedidoDraft construirPedidoDraft(CrearPedidoRequest request) {
        if(request.items() == null || request.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El pedido debe contener al menos un item");
        }
        BigDecimal total = BigDecimal.ZERO;
        List<DetallePedido> detalles = new ArrayList<>();
        boolean parcial = false;
        for(CrearPedidoItemRequest item : request.items()) {
            validarItemPedido(item);
            Producto producto = productoRepository.findById(item.idProducto())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Producto " + item.idProducto() + " no encontrado"));
            Talla talla = resolverTalla(item);
            Integer idTalla = talla.getIdTalla();
            ProductoTalla productoTalla = productoTallaRepository.findByProductoIdProductoAndTallaIdTalla(
                item.idProducto(), idTalla);
            int disponible = (productoTalla == null || productoTalla.getStock() == null) ? 0 : productoTalla.getStock();
            int cantidadSatisfecha = Math.min(disponible, item.cantidad());
            int cantidadPendiente = item.cantidad() - cantidadSatisfecha;
            if(cantidadPendiente > 0) {
                parcial = true;
            }
            DetallePedido detalle = new DetallePedido();
            detalle.setProducto(producto);
            detalle.setIdTalla(idTalla);
            detalle.setTalla(talla);
            detalle.setCantidad(item.cantidad());
            detalle.setCantidadSatisfecha(cantidadSatisfecha);
            detalle.setCantidadPendiente(cantidadPendiente);
            detalle.setEsBackorder(cantidadPendiente > 0);
            detalle.setPrecioUnitario(producto.getPrecio());
            detalles.add(detalle);
            total = total.add(producto.getPrecio().multiply(BigDecimal.valueOf(item.cantidad())));
        }
        if(detalles.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No hay items validos para el pedido");
        }
        return new PedidoDraft(total, detalles, parcial);
    }

    private void validarItemPedido(CrearPedidoItemRequest item) {
        if(item == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El item del pedido es requerido");
        }
        if(item.idProducto() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El producto es requerido");
        }
        if(item.cantidad() == null || item.cantidad() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La cantidad debe ser mayor a 0");
        }
    }

    private Talla resolverTalla(CrearPedidoItemRequest item) {
        if(item.idTalla() != null) {
            return tallaRepository.findById(item.idTalla())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Talla " + item.idTalla() + " no encontrada"));
        }
        if(item.talla() == null || item.talla().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La talla es requerida");
        }
        String nombreTalla = item.talla().trim();
        return tallaRepository.findByNombreIgnoreCase(nombreTalla)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Talla " + nombreTalla + " no encontrada"));
    }

    private void registrarPagoInicial(Pedido pedido, String metodoPago) {
        if(metodoPago == null || metodoPago.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El metodo de pago es requerido");
        }
        configuracionSitioService.validarMetodoPagoHabilitado(metodoPago);
        Pago pago = new Pago();
        pago.setPedido(pedido);
        
        // Normalizar nombre del método de pago para el registro
        String metodoNormalizado = switch (metodoPago.trim().toLowerCase()) {
            case "tarjeta", "stripe" -> "tarjeta";
            case "bizum" -> "bizum";
            case "transferencia bancaria", "transferencia" -> "transferencia bancaria";
            case "pago en mostrador", "mostrador", "presencial" -> "pago en mostrador";
            default -> metodoPago.trim();
        };
        pago.setMetodoPago(metodoNormalizado);
        pago.setFechaPago(LocalDate.now());
        pago.setMonto(pedido.getTotal());
        pago.setEstado("pendiente");
        pagoRepository.save(pago);
    }

    private void aplicarStock(List<DetallePedido> detalles, int factor) {
        for(DetallePedido detalle : detalles) {
            ProductoTalla productoTalla = productoTallaRepository.findByProductoIdProductoAndTallaIdTalla(
                detalle.getProducto().getIdProducto(), detalle.getIdTalla());
            if(productoTalla == null) {
                // Si no existe el registro de stock para esta talla, lo ignoramos (stock 0) 
                // en lugar de lanzar un error, para permitir pedidos bajo demanda
                continue; 
            }
            int stockActual = productoTalla.getStock() == null ? 0 : productoTalla.getStock();
            int cantidadStock = detalle.getCantidadSatisfecha() == null ? detalle.getCantidad() : detalle.getCantidadSatisfecha();
            int nuevoStock = stockActual + (cantidadStock * factor);
            if (nuevoStock < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock insuficiente para actualizar el pedido");
            }
            productoTalla.setStock(nuevoStock);
            productoTallaRepository.save(productoTalla);
            Producto producto = detalle.getProducto();
            int stockGeneral = (producto.getStock() == null ? 0 : producto.getStock()) + (cantidadStock * factor);
            producto.setStock(Math.max(0, stockGeneral));
            productoRepository.save(producto);
        }
    }

    private void registrarBackorders(Pedido pedido, List<DetallePedido> detalles) {
        for(DetallePedido detalle : detalles) {
            int pendiente = detalle.getCantidadPendiente() == null ? 0 : detalle.getCantidadPendiente();
            if(pendiente > 0) {
                backorderPedidoService.crear(
                        detalle.getIdDetalle(),
                        pedido.getIdPedido(),
                        detalle.getProducto().getIdProducto(),
                        detalle.getIdTalla(),
                        pendiente
                );
            }
        }
    }

    private void registrarHistorial(Pedido pedido, String tipoEvento, String estadoAnterior, String estadoNuevo, String descripcion) {
        PedidoHistorial historial = new PedidoHistorial();
        historial.setPedido(pedido);
        historial.setFechaCambio(LocalDateTime.now());
        historial.setTipoEvento(tipoEvento);
        historial.setEstadoAnterior(estadoAnterior);
        historial.setEstadoNuevo(estadoNuevo);
        historial.setDescripcion(descripcion);
        pedidoHistorialRepository.save(historial);
    }

    private void aplicarDatosRecepcion(
        PedidoEntrega entrega,
        String comprobanteEntregaUrl,
        String comprobanteEntregaNombreArchivo,
        String firmaRecepcion,
        String nombreRecibe,
        String documentoRecibe,
        String observaciones
    ) {
        entrega.setComprobanteEntregaUrl(blankToNull(comprobanteEntregaUrl));
        entrega.setComprobanteEntregaNombreArchivo(blankToNull(comprobanteEntregaNombreArchivo));
        entrega.setFirmaRecepcion(blankToNull(firmaRecepcion));
        entrega.setNombreRecibe(blankToNull(nombreRecibe));
        entrega.setDocumentoRecibe(blankToNull(documentoRecibe));
        entrega.setObservaciones(blankToNull(observaciones));
    }

    private boolean tieneFirmaRecepcion(Integer pedidoId) {
        return obtenerFirmaRecepcionGuardada(
            pedidoEntregaRepository.findByPedidoIdPedidoOrderByFechaEntregaDesc(pedidoId)
        ) != null;
    }

    private String obtenerFirmaRecepcionGuardada(List<PedidoEntrega> entregas) {
        if(entregas == null) {
            return null;
        }

        for(PedidoEntrega entrega : entregas) {
            String firma = entrega.getFirmaRecepcion();
            if(firma != null && !firma.isBlank()) {
                return firma;
            }
        }
        return null;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void notificarCambioEstadoSiAplica(Pedido pedido, String estadoAnterior, String estadoNuevo) {
        if(estadoAnterior == null || estadoNuevo == null || !estadoAnterior.equals(estadoNuevo)) {
            notificacionService.notificarCambioEstadoPedido(pedido, estadoAnterior, estadoNuevo);
        }
    }

    private record PedidoDraft(BigDecimal total, List<DetallePedido> detalles, boolean parcial) {
    }
}
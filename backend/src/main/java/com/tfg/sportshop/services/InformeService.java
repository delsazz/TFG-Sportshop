package com.tfg.sportshop.services;
import java.util.Map;
import java.util.List;
import java.util.Locale;
import java.util.HashMap;
import java.util.Objects;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.Comparator;
import java.time.LocalDateTime
import java.util.stream.Collectors;
import com.tfg.sportshop.model.Pago;
import java.util.function.Predicate;
import com.tfg.sportshop.model.Pedido;
import com.tfg.sportshop.model.Usuario;
import com.tfg.sportshop.model.Producto;
import org.springframework.http.HttpStatus;
import com.tfg.sportshop.model.DetallePedido;
import com.tfg.sportshop.model.ProductoTalla;
import org.springframework.stereotype.Service;
import com.tfg.sportshop.repository.PagoRepository;
import com.tfg.sportshop.repository.TallaRepository;
import com.tfg.sportshop.repository.PedidoRepository;
import com.tfg.sportshop.dto.admin.AdminPedidoResponse;
import com.tfg.sportshop.repository.ProductoRepository;
import com.tfg.sportshop.dto.admin.InformePagosResponse;
import com.tfg.sportshop.dto.admin.InformeStockResponse;
import com.tfg.sportshop.dto.admin.InformePedidosResponse;
import com.tfg.sportshop.repository.ProductoTallaRepository;
import com.tfg.sportshop.dto.admin.InformePagoEstadoResponse;
import com.tfg.sportshop.dto.admin.AdminPedidoUsuarioResponse;
import com.tfg.sportshop.dto.admin.InformePagoDetalleResponse;
import org.springframework.web.server.ResponseStatusException;
import com.tfg.sportshop.dto.admin.InformePedidoAlumnoResponse;
import com.tfg.sportshop.dto.admin.InformeStockProductoResponse;
import org.springframework.transaction.annotation.Transactional;
import com.tfg.sportshop.repository.PedidoEntregaLineaRepository;

@Service
public class InformeService {
    private static final int LOW_STOCK_THRESHOLD = 5;
    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final ProductoTallaRepository productoTallaRepository;
    private final TallaRepository tallaRepository;
    private final PagoRepository pagoRepository;
    private final PedidoEntregaLineaRepository pedidoEntregaLineaRepository;

    public InformeService(
        PedidoRepository pedidoRepository,
        ProductoRepository productoRepository,
        ProductoTallaRepository productoTallaRepository,
        TallaRepository tallaRepository,
        PagoRepository pagoRepository,
        PedidoEntregaLineaRepository pedidoEntregaLineaRepository
    ) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.productoTallaRepository = productoTallaRepository;
        this.tallaRepository = tallaRepository;
        this.pagoRepository = pagoRepository;
        this.pedidoEntregaLineaRepository = pedidoEntregaLineaRepository;
    }

    @Transactional(readOnly = true)
    public InformePedidosResponse obtenerInformePedidos(LocalDate fechaDesde, LocalDate fechaHasta, String estado) {
        validarRangoFechas(fechaDesde, fechaHasta);
        List<Pedido> pedidosFiltrados = pedidoRepository.findAllWithRelations().stream()
            .filter(pedidoEnRango(fechaDesde, fechaHasta)).filter(pedidoPorEstado(estado))
            .sorted(Comparator.comparing(Pedido::getFechaPedido).reversed()).toList();
        Map<Integer, List<Pedido>> pedidosAgrupados = pedidosFiltrados.stream()
            .filter(pedido -> pedido.getUsuario() != null)
            .collect(Collectors.groupingBy(pedido -> pedido.getUsuario().getIdUsuario()));
        List<InformePedidoAlumnoResponse> pedidosPorAlumno = pedidosAgrupados.values().stream()
            .map(this::toInformePedidoAlumnoResponse)
            .sorted(Comparator.comparing(InformePedidoAlumnoResponse::totalPedidos).reversed()
                .thenComparing(InformePedidoAlumnoResponse::nombre, Comparator.nullsLast(String::compareToIgnoreCase)))
            .toList();
        BigDecimal importeTotal = pedidosFiltrados.stream().map(Pedido::getTotal).filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        List<AdminPedidoResponse> pedidos = pedidosFiltrados.stream().map(this::toAdminPedidoResponse).toList();
        return new InformePedidosResponse(
            fechaDesde,
            fechaHasta,
            estado,
            (long) pedidosFiltrados.size(),
            (long) pedidosPorAlumno.size(),
            importeTotal,
            pedidosPorAlumno,
            pedidos
        );
    }

    @Transactional(readOnly = true)
    public InformeStockResponse obtenerInformeStock(String estado) {
        List<InformeStockProductoResponse> productos = productoRepository.findAll().stream()
            .map(this::toInformeStockProductoResponse)
            .filter(producto -> coincideEstadoStock(producto, estado))
            .sorted(Comparator.comparing(InformeStockProductoResponse::stock)
                .thenComparing(InformeStockProductoResponse::nombre, String.CASE_INSENSITIVE_ORDER)).toList();
        long productosAgotados = productos.stream().filter(producto -> "AGOTADO".equals(producto.estado())).count();
        long productosBajoStock = productos.stream().filter(producto -> "BAJO".equals(producto.estado())).count();
        long totalUnidades = productos.stream().mapToLong(producto -> normalizarStock(producto.stock())).sum();
        return new InformeStockResponse(
            estado,
            (long) productos.size(),
            totalUnidades,
            productosAgotados,
            productosBajoStock,
            productos
        );
    }

    @Transactional(readOnly = true)
    public InformePagosResponse obtenerInformePagos(LocalDate fechaDesde, LocalDate fechaHasta, String estado) {
        validarRangoFechas(fechaDesde, fechaHasta);
        List<Pago> pagosFiltrados = pagoRepository.findAll().stream()
            .filter(pagoEnRango(fechaDesde, fechaHasta))
            .filter(pagoPorEstado(estado))
            .sorted(Comparator.comparing(Pago::getFechaPago).reversed()
                .thenComparing(Pago::getIdPago, Comparator.reverseOrder())).toList();
        BigDecimal importeTotal = pagosFiltrados.stream().map(Pago::getMonto).filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal importePendiente = pagosFiltrados.stream()
            .filter(pago -> esEstadoPago(pago.getEstado(), "pendiente")).map(Pago::getMonto)
            .filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal importeCompletado = pagosFiltrados.stream()
            .filter(pago -> esEstadoPago(pago.getEstado(), "completado", "completado_total", "pagado"))
            .map(Pago::getMonto).filter(Objects::nonNull) .reduce(BigDecimal.ZERO, BigDecimal::add);
        List<InformePagoEstadoResponse> resumenPorEstado = pagosFiltrados.stream()
            .collect(Collectors.groupingBy(pago -> normalizarTexto(pago.getEstado()), Collectors.toList()))
            .entrySet().stream()
            .map(entry -> new InformePagoEstadoResponse(
                entry.getKey(),
                (long) entry.getValue().size(),
                entry.getValue().stream().map(Pago::getMonto).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add)))
            .sorted(Comparator.comparing(InformePagoEstadoResponse::estado))
            .toList();
        List<InformePagoDetalleResponse> pagos = pagosFiltrados.stream().map(this::toInformePagoDetalleResponse).toList();
        return new InformePagosResponse(
            fechaDesde,
            fechaHasta,
            estado,
            (long) pagosFiltrados.size(),
            importeTotal,
            importePendiente,
            importeCompletado,
            resumenPorEstado,
            pagos
        );
    }

        // Updated predicates and sorting to use fechaPedido
        private Predicate<Pedido> pedidoEnRango(LocalDate fechaDesde, LocalDate fechaHasta) {
            return pedido -> {
                LocalDate fechaPedido = pedido.getFechaPedido() == null ? null : pedido.getFechaPedido().toLocalDate();
                if (fechaPedido == null) {
                    return false;
                }
                if (fechaDesde != null && fechaPedido.isBefore(fechaDesde)) {
                    return false;
                }
                if (fechaHasta != null && fechaPedido.isAfter(fechaHasta)) {
                    return false;
                }
                return true;
            };
        }

        private Predicate<Pedido> pedidoPorEstado(String estado) {
            return pedido -> estado == null || estado.isBlank() || normalizarTexto(pedido.getEstado()).equals(normalizarTexto(estado));
        }

        private InformePedidoAlumnoResponse toInformePedidoAlumnoResponse(List<Pedido> pedidos) {
            Usuario usuario = pedidos.getFirst().getUsuario();
            BigDecimal importeTotal = pedidos.stream().map(Pedido::getTotal).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            var ultimoPedido = pedidos.stream().map(Pedido::getFechaPedido).filter(Objects::nonNull).max(Comparator.naturalOrder())
                .orElse(null);
            return new InformePedidoAlumnoResponse(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getApellidos(),
                usuario.getEmail(),
                (long) pedidos.size(),
                importeTotal,
                ultimoPedido
            );
        }

        private AdminPedidoResponse toAdminPedidoResponse(Pedido pedido) {
            Map<Integer, Integer> cantidadesEntregadas = pedidoEntregaLineaRepository.sumEntregadoPorPedido(pedido.getIdPedido())
                .stream().collect(Collectors.toMap(fila -> (Integer) fila[0], fila -> ((Long) fila[1]).intValue()));
            int totalUnidades = pedido.getDetalles() == null ? 0 : pedido.getDetalles().stream()
                .mapToInt(detalle -> detalle.getCantidad() == null ? 0 : detalle.getCantidad()).sum();
            int unidadesEntregadas = pedido.getDetalles() == null ? 0
                : pedido.getDetalles().stream().mapToInt(detalle -> Math.min(
                    cantidadesEntregadas.getOrDefault(detalle.getIdDetalle(), 0),
                    detalle.getCantidad() == null ? 0 : detalle.getCantidad()
                ))
                .sum();
            return new AdminPedidoResponse(
                pedido.getIdPedido(),
                pedido.getFechaPedido(),
                pedido.getTotal(),
                pedido.getEstado(),
                toAdminPedidoUsuarioResponse(pedido.getUsuario()),
                pedido.getDetalles() == null ? 0 : pedido.getDetalles().size(),
                totalUnidades,
                unidadesEntregadas,
                Math.max(totalUnidades - unidadesEntregadas, 0)
            );
        }

    private Predicate<Pago> pagoEnRango(LocalDate fechaDesde, LocalDate fechaHasta) {
        return pago -> {
            LocalDate fechaPago = pago.getFechaPago() == null ? null : pago.getFechaPago().toLocalDate();
            if(fechaPago == null) {
                return false;
            }
            if(fechaDesde != null && fechaPago.isBefore(fechaDesde)) {
                return false;
            }
            if(fechaHasta != null && fechaPago.isAfter(fechaHasta)) {
                return false;
            }
            return true;
        };
    }

    private Predicate<Pago> pagoPorEstado(String estado) {
        return pago -> estado == null || estado.isBlank() || normalizarTexto(pago.getEstado()).equals(normalizarTexto(estado));
    }

    private AdminPedidoUsuarioResponse toAdminPedidoUsuarioResponse(Usuario usuario) {
        if(usuario == null) {
            return null;
        }
        return new AdminPedidoUsuarioResponse(
            usuario.getIdUsuario(),
            usuario.getNombre(),
            usuario.getApellidos(),
            usuario.getEmail()
        );
    }

    private InformeStockProductoResponse toInformeStockProductoResponse(Producto producto) {
        Integer stock = normalizarStock(producto.getStock());
        return new InformeStockProductoResponse(
            producto.getIdProducto(),
            producto.getNombre(),
            null,
            null,
            producto.getCategoria() == null ? null : producto.getCategoria().getNombreCategoria(),
            producto.getPrecio(),
            stock,
            calcularEstadoStock(stock)
        );
    }

    private Map<String, Integer> calcularPendientesEntregaPorReferencia() {
        Map<String, Integer> pendientes = new HashMap<>();
        for(Pedido pedido : pedidoRepository.findAllWithRelations()) {
            if(pedido.getDetalles() == null || esPedidoCerrado(pedido)) {
                continue;
            }
            Map<Integer, Integer> cantidadesEntregadas = pedidoEntregaLineaRepository.sumEntregadoPorPedido(pedido.getIdPedido())
                .stream().collect(Collectors.toMap(fila -> (Integer) fila[0], fila -> ((Long) fila[1]).intValue()));
            for(DetallePedido detalle : pedido.getDetalles()) {
                if(detalle.getProducto() == null || detalle.getIdTalla() == null) {
                    continue;
                }
                int pedida = detalle.getCantidad() == null ? 0 : detalle.getCantidad();
                int entregada = cantidadesEntregadas.getOrDefault(detalle.getIdDetalle(), 0);
                int pendiente = Math.max(pedida - entregada, 0);
                if(pendiente > 0) {
                    pendientes.merge(referencia(detalle.getProducto().getIdProducto(), detalle.getIdTalla()), pendiente, Integer::sum);
                }
            }
        }
        return pendientes;
    }

    private String referencia(Integer idProducto, Integer idTalla) {
        return (idProducto == null ? 0 : idProducto) + ":" + (idTalla == null ? 0 : idTalla);
    }

    private boolean esPedidoCerrado(Pedido pedido) {
        String estado = normalizarTexto(pedido.getEstado());
        return estado.equals("cancelado") || estado.equals("entregado_completo") || estado.equals("entregado completo");
    }

    private int normalizarStockMinimo(Producto producto) {
        return producto == null || producto.getStockMinimo() == null ? LOW_STOCK_THRESHOLD : Math.max(producto.getStockMinimo(), 0);
    }

    private int normalizarLoteCompra(Producto producto) {
        return producto == null || producto.getLoteCompra() == null ? 1 : Math.max(producto.getLoteCompra(), 1);
    }

    private int redondearALote(int cantidad, int lote) {
        if(cantidad <= 0) return 0;
        return((cantidad + lote - 1) / lote) * lote;
    }

    private String calcularPrioridad(int stockProyectado, int pendienteEntrega, int cantidadSugerida) {
        if(stockProyectado < 0 || (pendienteEntrega > 0 && cantidadSugerida > 0)) {
            return "CRITICA";
        }
        if(cantidadSugerida > 0) {
            return "REPOSICION";
        }
        return "SEGUIMIENTO";
    }

    private String normalizarProveedor(String proveedor) {
        return proveedor == null || proveedor.isBlank() ? "Proveedor pendiente" : proveedor.trim();
    }

    private String normalizarTextoNullable(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private String normalizarEstadoProveedor(String estado) {
        if(estado == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado requerido");
        }
        return switch (estado.trim().toUpperCase(Locale.ROOT)) {
            case "CREADO", "BORRADOR" -> "CREADO";
            case "PENDIENTE", "PENDIENTE_ENTREGA", "ENVIADO" -> "PENDIENTE_ENTREGA";
            case "ENTREGADO", "RECIBIDO" -> "ENTREGADO";
            case "CANCELADO" -> "CANCELADO";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado de proveedor no valido");
        };
    }

    private boolean coincideEstadoStock(InformeStockProductoResponse producto, String estado) {
        return estado == null || estado.isBlank() || producto.estado().equalsIgnoreCase(estado);
    }

    private Integer normalizarStock(Integer stock) {
        return stock == null ? 0 : stock;
    }

    private String calcularEstadoStock(Integer stock) {
        int stockNormalizado = normalizarStock(stock);
        if(stockNormalizado <= 0) {
            return "AGOTADO";
        }
        if(stockNormalizado <= LOW_STOCK_THRESHOLD) {
            return "BAJO";
        }
        return "DISPONIBLE";
    }

    private InformePagoDetalleResponse toInformePagoDetalleResponse(Pago pago) {
        Pedido pedido = pago.getPedido();
        Usuario usuario = pedido == null ? null : pedido.getUsuario();
        return new InformePagoDetalleResponse(
            pago.getIdPago(),
            pedido == null ? null : pedido.getIdPedido(),
            usuario == null ? null : usuario.getIdUsuario(),
            usuario == null ? null : (usuario.getNombre() + " " + usuario.getApellidos()).trim(),
            usuario == null ? null : usuario.getEmail(),
            null,
            pago.getFechaPago() == null ? null : pago.getFechaPago().toLocalDate(),
            pago.getMonto(),
            pago.getEstado()
        );
    }

    private boolean esEstadoPago(String estadoActual, String... estadosEsperados) {
        String estadoNormalizado = normalizarTexto(estadoActual);
        for(String esperado : estadosEsperados) {
            if(estadoNormalizado.equals(normalizarTexto(esperado))) {
                return true;
            }
        }
        return false;
    }

    private String normalizarTexto(String valor) {
        return valor == null ? "" : valor.trim().toLowerCase(Locale.ROOT);
    }

    private void validarRangoFechas(LocalDate fechaDesde, LocalDate fechaHasta) {
        if(fechaDesde != null && fechaHasta != null && fechaDesde.isAfter(fechaHasta)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fechaDesde no puede ser posterior a fechaHasta");
        }
    }
}

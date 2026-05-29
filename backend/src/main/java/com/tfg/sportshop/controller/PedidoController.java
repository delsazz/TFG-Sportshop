package com.tfg.sportshop.controller;

import jakarta.validation.Valid;
import com.tfg.sportshop.model.Pago;
import com.tfg.sportshop.dto.admin.*;
import com.tfg.sportshop.model.Pedido;
import com.tfg.sportshop.model.Usuario;
import org.springframework.http.HttpStatus;
import com.tfg.sportshop.model.DetallePedido;
import com.tfg.sportshop.model.PedidoEntrega;
import com.tfg.sportshop.model.PedidoHistorial;
import com.tfg.sportshop.services.PedidoService;
import com.tfg.sportshop.dto.pedidos.FirmarEntregaPedidoRequest;
import org.springframework.web.bind.annotation.*;
import com.tfg.sportshop.model.PedidoEntregaLinea;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;
import java.util.List;

@RestController
public class PedidoController {
    private final PedidoService pedidoService;
    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping("/api/pedidos/mis-pedidos")
    public List<PedidoResponse> misPedidos() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        Usuario usuario = (Usuario) auth.getPrincipal();
        return pedidoService.buscarPedidosPorUsuario(usuario.getIdUsuario()).stream().map(this::toPedidoResponse).toList();
    }

    @PostMapping("/api/pedidos")
    public PedidoResponse crearPedido(@Valid @RequestBody CrearPedidoRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        Usuario usuario = (Usuario) auth.getPrincipal();
        Pedido pedido = pedidoService.crearPedido(usuario, request);
        return toPedidoResponse(pedido);
    }

    @PostMapping("/api/admin/pedidos")
    public AdminPedidoResponse crearPedidoAdmin(@Valid @RequestBody AdminCrearPedidoRequest request) {
        validarAdministrador();
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(request.idUsuario());
        Pedido pedido = pedidoService.crearPedido(usuario, new CrearPedidoRequest(request.items(), request.metodoPago()));
        return toPedidoAdminResponse(pedido);
    }

    @PutMapping("/api/admin/pedidos/{idPedido}")
    public AdminPedidoResponse actualizarPedidoAdmin(@PathVariable Long idPedido, @Valid @RequestBody AdminActualizarPedidoRequest request) {
        validarAdministrador();
        Pedido pedido = pedidoService.actualizarPedidoAdmin(idPedido, request.idUsuario(), request.estado(), 
                new CrearPedidoRequest(request.items(), "ADMIN"));
        return toPedidoAdminResponse(pedido);
    }

    @GetMapping("/api/pedidos")
    public List<AdminPedidoResponse> verPedidos() {
        validarAdministrador();
        return pedidoService.verPedidos().stream().map(this::toPedidoAdminResponse).toList();
    }

    @GetMapping("/api/pedidos/{idPedido}")
    public Object verPedido(@PathVariable Long idPedido) {
        Pedido pedido = pedidoService.buscarPedidoPorId(idPedido);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean esAdmin = false;
        if(auth != null && auth.isAuthenticated()) {
            Usuario usuarioAuth = (Usuario) auth.getPrincipal();
            esAdmin = auth.getAuthorities().stream().anyMatch(authority -> "ROLE_ADMIN".equalsIgnoreCase(authority.getAuthority()));
            if(!esAdmin && pedido.getUsuario() != null && !usuarioAuth.getIdUsuario().equals(pedido.getUsuario().getIdUsuario())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para ver este pedido");
            }
        }
        return esAdmin ? toPedidoDetalleResponse(pedido) : toPedidoResponse(pedido);
    }

    @PutMapping("/api/pedidos/{idPedido}/estado")
    public AdminPedidoResponse actualizarEstado(@PathVariable Long idPedido, @Valid @RequestBody ActualizarEstadoPedidoRequest request) {
        validarAdministrador();
        return toPedidoAdminResponse(pedidoService.actualizarEstado(idPedido, request.estado()));
    }

    @PostMapping("/api/pedidos/{idPedido}/entregas")
    public AdminPedidoDetalleResponse registrarEntrega(@PathVariable Long idPedido, @Valid @RequestBody RegistrarEntregaPedidoRequest request) {
        validarAdministrador();
        return toPedidoDetalleResponse(pedidoService.registrarEntrega(idPedido, request));
    }

    @PostMapping("/api/pedidos/{idPedido}/firmar-entrega")
    public PedidoResponse firmarEntregaCliente(@PathVariable Long idPedido, @RequestBody FirmarEntregaPedidoRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof Usuario usuario)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        return toPedidoResponse(pedidoService.firmarEntregaCliente(idPedido, usuario, request));
    }

    @PutMapping("/api/pedidos/{idPedido}/entregas")
    public AdminPedidoDetalleResponse actualizarEntregas(@PathVariable Long idPedido, @Valid @RequestBody ActualizarEntregasPedidoRequest request) {
        validarAdministrador();
        return toPedidoDetalleResponse(pedidoService.actualizarEntregas(idPedido, request));
    }

    @DeleteMapping("/api/pedidos/{idPedido}/entregas/{idEntrega}")
    public AdminPedidoDetalleResponse eliminarEntrega(@PathVariable Long idPedido, @PathVariable Integer idEntrega) {
        validarAdministrador();
        return toPedidoDetalleResponse(pedidoService.deshacerEntrega(idPedido, idEntrega));
    }

    private PedidoResponse toPedidoResponse(Pedido pedido) {
        List<PedidoLineaResponse> detalles = pedido.getDetalles() == null
                ? List.of() : pedido.getDetalles().stream().map(this::toPedidoLineaResponse).toList();
        List<AdminPagoResponse> pagos = pedido.getPagos() == null
                ? List.of() : pedido.getPagos().stream().map(this::toPagoResponse).toList();       
        List<EntregaResponse> entregas = pedidoService.verEntregas(pedido.getIdPedido()).stream()
                .map(entrega -> toEntregaResponse(entrega, pedido.getEstado())).toList();        
        return new PedidoResponse(pedido.getIdPedido(), pedido.getFechaPedido(), pedido.getTotal(), pedido.getEstado(), detalles, pagos, entregas);  
    }

    private PedidoLineaResponse toPedidoLineaResponse(DetallePedido detalle) {
        return new PedidoLineaResponse(detalle.getIdDetalle(), 
                detalle.getProducto() == null ? null : detalle.getProducto().getIdProducto(),
                detalle.getProducto() == null ? null : (detalle.getProducto().getNombre() != null ? 
                detalle.getProducto().getNombre() : "Producto " + detalle.getProducto().getIdProducto()),
                detalle.getTalla() == null ? null : detalle.getTalla().getNombre(), detalle.getCantidad(), detalle.getPrecioUnitario(),
                detalle.getProducto() == null ? null : detalle.getProducto().getImagen() );
    }

    private AdminPedidoResponse toPedidoAdminResponse(Pedido pedido) {
        var cantidadesEntregadas = pedidoService.obtenerCantidadesEntregadas(pedido.getIdPedido());
        int totalUnidades = 0;
        int unidadesEntregadas = 0;
        if(pedido.getDetalles() != null) {
            for(DetallePedido detalle : pedido.getDetalles()) {
                int cantidad = detalle.getCantidad() == null ? 0 : detalle.getCantidad();
                int entregada = cantidadesEntregadas.getOrDefault(detalle.getIdDetalle(), 0);
                totalUnidades += cantidad;
                unidadesEntregadas += Math.min(entregada, cantidad);
            }
        }

        return new AdminPedidoResponse(pedido.getIdPedido(), pedido.getFecha(), pedido.getTotal(), pedido.getEstado(),
                toPedidoUsuarioResponse(pedido.getUsuario()),
                pedido.getDetalles() == null ? 0 : pedido.getDetalles().size(), totalUnidades, unidadesEntregadas,
                Math.max(totalUnidades - unidadesEntregadas, 0));
    }

    private AdminPedidoDetalleResponse toPedidoDetalleResponse(Pedido pedido) {
        var cantidadesEntregadas = pedidoService.obtenerCantidadesEntregadas(pedido.getIdPedido());
        var estadosEntrega = pedidoService.obtenerEstadosEntrega(pedido.getIdPedido());
        List<AdminPedidoLineaResponse> detalles = pedido.getDetalles() == null
                ? List.of() : pedido.getDetalles().stream() 
                .map(detalle -> toPedidoLineaResponse(detalle, cantidadesEntregadas, estadosEntrega)).toList();
        List<AdminPagoResponse> pagos = pedido.getPagos() == null ? List.of()
                : pedido.getPagos().stream().map(this::toPagoResponse).toList();
        List<AdminPedidoHistorialResponse> historial = pedidoService.verHistorial(pedido.getIdPedido().longValue())
                .stream().map(this::toPedidoHistorialResponse).toList();
        return new AdminPedidoDetalleResponse(pedido.getIdPedido(), pedido.getFecha(), pedido.getTotal(), pedido.getEstado(),
                toPedidoUsuarioResponse(pedido.getUsuario()), detalles, pagos, historial, 
                pedidoService.verEntregas(pedido.getIdPedido()).stream()
                        .map(entrega -> toEntregaResponse(entrega, pedido.getEstado())).toList());
    }

    private AdminPedidoUsuarioResponse toPedidoUsuarioResponse(Usuario usuario) {
        if(usuario == null) {
            return null;
        } 
        return new AdminPedidoUsuarioResponse(usuario.getIdUsuario(), usuario.getNombre(), usuario.getApellidos(), usuario.getEmail());
    }

    private AdminPedidoLineaResponse toPedidoLineaResponse(DetallePedido detalle, java.util.Map<Integer, Integer> cantidadesEntregadas, 
            java.util.Map<Integer, String> estadosEntrega) {
        int cantidadEntregada = cantidadesEntregadas.getOrDefault(detalle.getIdDetalle(), 0);
        return new AdminPedidoLineaResponse(detalle.getIdDetalle(), detalle.getCantidad(), cantidadEntregada,
                Math.max(detalle.getCantidad() - cantidadEntregada, 0),  detalle.getPrecioUnitario(),
                detalle.getProducto() == null ? null : detalle.getProducto().getIdProducto(),
                detalle.getProducto() == null ? null : (detalle.getProducto().getNombre() != null ? detalle.getProducto().getNombre() 
                : "Producto " + detalle.getProducto().getIdProducto()), detalle.getIdTalla(),
                detalle.getTalla() == null ? null : detalle.getTalla().getNombre(),
                estadosEntrega.getOrDefault(detalle.getIdDetalle(), "SIN_ENTREGAR"),
                detalle.getProducto() == null ? null : detalle.getProducto().getImagen());
    }

    private AdminPagoResponse toPagoResponse(Pago pago) {
        return new AdminPagoResponse(pago.getIdPago(), pago.getMetodoPago(), pago.getFechaPago(),
                pago.getMonto(), pago.getEstado(), pago.getComprobanteUrl(), pago.getComprobanteNombreArchivo(),
                pago.getFechaConfirmacion(), pago.getNotasAdmin());
    }

    private AdminPedidoHistorialResponse toPedidoHistorialResponse(PedidoHistorial historial) {
        return new AdminPedidoHistorialResponse(historial.getIdHistorial(), historial.getFechaCambio(), 
                historial.getTipoEvento(), historial.getEstadoAnterior(), historial.getEstadoNuevo(), 
                historial.getDescripcion());
    }

    private EntregaResponse toEntregaResponse(PedidoEntrega entrega, String estadoPedido) {
        List<EntregaLineaResponse> lineas = entrega.getLineas() == null  ? List.of()  
                : entrega.getLineas().stream().map(this::toEntregaLineaResponse).toList();
        boolean completo = lineas.stream().allMatch(linea -> linea.cantidadPendiente() != null && linea.cantidadPendiente() == 0);
        return new EntregaResponse(entrega.getIdEntrega(), entrega.getFechaEntrega(), lineas, entrega.getComprobanteEntregaUrl(),
                entrega.getComprobanteEntregaNombreArchivo(), entrega.getFirmaRecepcion(), entrega.getNombreRecibe(),
                entrega.getDocumentoRecibe(), entrega.getTipoReceptor(), entrega.getAutorizanteNombre(),
                entrega.getAutorizanteDocumento(), entrega.getTextoAutorizacion(), entrega.getObservaciones(), estadoPedido, completo);
    }

    private EntregaLineaResponse toEntregaLineaResponse(PedidoEntregaLinea linea) {
        DetallePedido detalle = linea.getDetalle();
        int cantidadPedida = detalle == null || detalle.getCantidad() == null ? 0 : detalle.getCantidad();
        int cantidadEntregada = linea.getCantidad() == null ? 0 : linea.getCantidad();
        return new EntregaLineaResponse(
                detalle == null ? null : detalle.getIdDetalle(),
                detalle == null || detalle.getProducto() == null ? null : detalle.getProducto().getNombre(),
                cantidadPedida, 0, cantidadEntregada, cantidadEntregada, Math.max(cantidadPedida - cantidadEntregada, 0));
    }

    private void validarAdministrador() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        boolean esAdmin = auth.getAuthorities().stream().anyMatch(authority -> "ROLE_ADMIN".equalsIgnoreCase(authority.getAuthority()));
        if(!esAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Se requieren permisos de administrador");
        }
    }
}

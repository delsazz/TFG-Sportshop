package com.tfg.sportshop.services;

import com.tfg.sportshop.dto.devoluciones.SolicitudDevolucionItemRequest;
import com.tfg.sportshop.dto.devoluciones.SolicitudDevolucionRequest;
import com.tfg.sportshop.model.*;
import com.tfg.sportshop.repository.DetallePedidoRepository;
import com.tfg.sportshop.repository.DevolucionRepository;
import com.tfg.sportshop.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DevolucionService {

    @Autowired
    private DevolucionRepository devolucionRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    @Transactional
    public Devolucion solicitarDevolucion(Usuario usuario, SolicitudDevolucionRequest request) {
        Pedido pedido = pedidoRepository.findById(request.idPedido())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));

        // Validar que el pedido pertenece al usuario
        if (!pedido.getUsuario().getIdUsuario().equals(usuario.getIdUsuario())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para devolver este pedido");
        }

        // Validar que el pedido este entregado (parcial o completo)
        EstadoPedido estado = pedido.getEstadoEnum();
        if (estado != EstadoPedido.ENTREGADO_PARCIAL && estado != EstadoPedido.ENTREGADO_COMPLETO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se pueden devolver pedidos entregados");
        }

        Devolucion devolucion = new Devolucion();
        devolucion.setPedido(pedido);
        devolucion.setUsuario(usuario);
        devolucion.setMotivo(request.motivo());
        devolucion.setEstado(DevolucionEstado.SOLICITADA);
        devolucion.setFechaSolicitud(LocalDateTime.now());

        List<DevolucionItem> items = new ArrayList<>();
        for (SolicitudDevolucionItemRequest itemReq : request.items()) {
            DetallePedido detalle = detallePedidoRepository.findById(itemReq.idDetallePedido())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Línea de pedido no encontrada: " + itemReq.idDetallePedido()));

            if (!detalle.getPedido().getIdPedido().equals(pedido.getIdPedido())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La línea de pedido no corresponde a este pedido");
            }

            if (itemReq.cantidad() > detalle.getCantidad()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La cantidad a devolver supera la cantidad comprada");
            }

            DevolucionItem item = new DevolucionItem();
            item.setDevolucion(devolucion);
            item.setDetallePedido(detalle);
            item.setCantidad(itemReq.cantidad());
            items.add(item);
        }

        devolucion.setItems(items);
        return devolucionRepository.save(devolucion);
    }

    @Transactional(readOnly = true)
    public List<Devolucion> listarDevolucionesUsuario(Usuario usuario) {
        return devolucionRepository.findByUsuario(usuario);
    }

    @Transactional(readOnly = true)
    public List<Devolucion> listarTodasLasDevoluciones() {
        return devolucionRepository.findAll();
    }

    @Transactional
    public Devolucion actualizarEstadoDevolucion(Integer idDevolucion, DevolucionEstado nuevoEstado, String comentarios) {
        Devolucion devolucion = devolucionRepository.findById(idDevolucion)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Devolución no encontrada"));

        devolucion.setEstado(nuevoEstado);
        devolucion.setFechaResolucion(LocalDateTime.now());
        devolucion.setComentariosAdmin(comentarios);

        return devolucionRepository.save(devolucion);
    }

    @Transactional(readOnly = true)
    public Devolucion obtenerDevolucion(Integer id) {
        return devolucionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Devolución no encontrada"));
    }
}

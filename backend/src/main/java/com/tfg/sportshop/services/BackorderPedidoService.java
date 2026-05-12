package com.tfg.sportshop.services;

import com.tfg.sportshop.dto.admin.BackorderResponse;
import com.tfg.sportshop.model.BackorderPedido;
import com.tfg.sportshop.repository.BackorderPedidoRepository;
import com.tfg.sportshop.repository.ProductoTallaRepository;
import com.tfg.sportshop.repository.ProductoRepository;
import com.tfg.sportshop.repository.TallaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BackorderPedidoService {

    @Autowired
    private BackorderPedidoRepository backorderRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private TallaRepository tallaRepository;

    @Autowired
    private ProductoTallaRepository productoTallaRepository;

    public List<BackorderPedido> obtenerBackordersPendientes() {
        return backorderRepository.findPendingBackorders();
    }

    public List<BackorderPedido> obtenerBackordersPorProducto(Integer idProducto) {
        return backorderRepository.findPendingByProducto(idProducto);
    }

    public List<BackorderPedido> obtenerTodosBackorders() {
        return backorderRepository.findAll();
    }

    public BackorderPedido crear(Integer idDetalle, Integer idPedido, Integer idProducto,
                                 Integer idTalla, Integer cantidadFaltante) {
        BackorderPedido backorder = new BackorderPedido(idDetalle, idPedido, idProducto, idTalla, cantidadFaltante);
        return backorderRepository.save(backorder);
    }

    public BackorderPedido actualizar(Integer idBackorder, String estado, String observaciones) {
        BackorderPedido backorder = backorderRepository.findById(idBackorder)
                .orElseThrow(() -> new RuntimeException("Backorder no encontrado"));
        backorder.setEstado(estado);
        backorder.setObservaciones(observaciones);
        if ("RESUELTO".equalsIgnoreCase(estado)) {
            backorder.setFechaResuelto(java.time.LocalDateTime.now());
        }
        return backorderRepository.save(backorder);
    }

    public void eliminar(Integer idBackorder) {
        backorderRepository.deleteById(idBackorder);
    }

    public void eliminarPorPedido(Integer idPedido) {
        backorderRepository.deleteByIdPedido(idPedido);
    }

    public BackorderResponse toResponse(BackorderPedido backorder) {
        String nombreProducto = productoRepository.findById(backorder.getIdProducto())
                .map(p -> p.getNombre())
                .orElse("Producto desconocido");

        String talla = backorder.getIdTalla() != null
                ? tallaRepository.findById(backorder.getIdTalla())
                    .map(t -> t.getNombre())
                    .orElse("N/A")
                : "N/A";

        Integer stockActual = 0;
        if (backorder.getIdTalla() != null) {
            var productoTalla = productoTallaRepository.findByProductoIdProductoAndTallaIdTalla(
                    backorder.getIdProducto(),
                    backorder.getIdTalla()
            );
            stockActual = productoTalla == null || productoTalla.getStock() == null ? 0 : productoTalla.getStock();
        }

        return new BackorderResponse(
                backorder.getIdBackorder(),
                backorder.getIdPedido(),
                backorder.getIdProducto(),
                nombreProducto,
                talla,
                stockActual,
                backorder.getCantidadFaltante(),
                backorder.getCantidadRecibidaParcial(),
                backorder.getFechaCreacion(),
                backorder.getFechaResuelto(),
                backorder.getEstado(),
                backorder.getObservaciones()
        );
    }
}


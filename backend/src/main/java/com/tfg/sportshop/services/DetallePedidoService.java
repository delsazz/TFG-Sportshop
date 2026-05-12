package com.tfg.sportshop.services;

import java.util.List;
import java.util.Collections;
import org.springframework.stereotype.Service;
import com.tfg.sportshop.model.DetallePedido;
import org.springframework.beans.factory.annotation.Autowired;
import com.tfg.sportshop.repository.DetallePedidoRepository;
@Service
public class DetallePedidoService {
    @Autowired
    private DetallePedidoRepository detallePedidoRepository;
    public List<DetallePedido> verDetallesPedido(int idPedido) {
        return detallePedidoRepository.findByPedidoIdPedido(idPedido);
    }
    public List<DetallePedido> verDetallesProducto(int idProducto) {
        return detallePedidoRepository.findByProductoIdProducto(idProducto);
    }
    public List<DetallePedido> buscarDetallePorPedidoYProducto(int idPedido, int idProducto) {
        return Collections.singletonList(detallePedidoRepository.findByPedidoIdPedidoAndProductoIdProducto(idPedido, idProducto));
    }
}
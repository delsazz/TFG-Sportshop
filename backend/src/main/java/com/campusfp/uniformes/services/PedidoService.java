package com.campusfp.uniformes.services;
import com.campusfp.uniformes.model.Pedido;
import com.campusfp.uniformes.model.Detalle;
import com.campusfp.uniformes.repository.PedidoRepository;
import com.campusfp.uniformes.repository.DetalleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {
    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private DetalleRepository detalleRepository;

    public List<Pedido> obtenerPorUsuario(String correo) {
        return pedidoRepository.findByUsuario_CorreoElectronico(correo);
    }

    public Pedido crearPedido(Pedido pedido, List<Detalle> detalles) {
        Pedido guardado = pedidoRepository.save(pedido);
        if(detalles != null) {
            for(Detalle d : detalles) {
                d.setPedido(guardado);
                detalleRepository.save(d);
            }
        }
        return guardado;
    }
    
    public Optional<Pedido> obtenerPorId(Integer id) {
        return pedidoRepository.findById(id);
    }
}

package es.sportshop.servicios;
import java.util.List;
import es.sportshop.model.Detalle;
import org.springframework.stereotype.Service;
import es.sportshop.repositories.DetalleRepository;
import org.springframework.beans.factory.annotation.Autowired;

// Anotación de Spring para crear un bean
@Service
public class ServicioDetalle {

    // Anotación de Spring para inyección de dependencias
    @Autowired

    // Atributos para la clase ServicioDetalle
    private DetalleRepository detalleRepository;

    // Función para ver los detalles del pedido
    public List<Detalle> verDetallesPedido(int idPedido) {
        return detalleRepository.buscarPedidoPorId(idPedido);
    }

    // Función para guardar el detalle
    public Detalle guardarDetalle(Detalle detalle) {
        return detalleRepository.save(detalle);
    }
}
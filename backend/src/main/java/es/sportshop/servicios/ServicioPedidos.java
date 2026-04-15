package es.sportshop.servicios;
import es.sportshop.model.Pedido;
import es.sportshop.repositorios.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

// Anotación de Spring para crear un bean
@Service
public class ServicioPedidos {

    // Anotación de Spring para inyección de dependencias
    @Autowired

    // Atributos para la clase ServicioPedidos
    private PedidoRepository pedidoRepository;

    // Función para guardar un pedido
    public Pedido guardarPedido(Pedido pedido) {
        return pedidoRepository.save(pedido);
    }

    // Función para ver todos los pedidos
    public List<Pedido> verPedidos() {
        return pedidoRepository.findAll();
    }

    // Función para ver los pedidos de un usuario
    public List<Pedido> verPedidosUsuario(String correo) {
        return pedidoRepository.buscarPedidoPorUsuario(correo);
    }
}
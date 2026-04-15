package es.sportshop.repositories;
import java.util.List;
import es.sportshop.model.Pedido;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;

// Anotación de Spring para indicar que es un repositorio
@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    // Anotación para ver los pedidos de un cliente
    @Query("SELECT pedido FROM Pedido pedido WHERE pedido.usuario.correoElectronico LIKE CONCAT('%', :correoElectronico)")

    // Función para buscar pedido por usuario a partir de la query
    List<Pedido> buscarPedidoPorUsuario(String correoElectronico);
}
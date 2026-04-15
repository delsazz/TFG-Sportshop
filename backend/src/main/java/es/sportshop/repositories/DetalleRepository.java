package es.sportshop.repositories;
import java.util.List;
import es.sportshop.model.Detalle;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

// Anotación de Spring para indicar que es un repositorio
@Repository
public interface DetalleRepository extends JpaRepository<Detalle, Integer> {

    // Anotación de Spring para buscar pedido por Id - CORREGIDO
    @Query("SELECT detalle FROM Detalle detalle WHERE detalle.pedido.idPedido = :idPedido")

    // Función para buscar pedido por id - AÑADIDO @Param
    List<Detalle> buscarPedidoPorId(@Param("idPedido") int idPedido);
}
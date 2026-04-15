package es.sportshop.repositorios;
import es.sportshop.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

// Anotación de Spring para indicar que es un repositorio
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    // Anptación de Spring para buscar producto por nombre
    @Query("SELECT producto FROM Producto producto WHERE producto.nombre =  :nombre")

    // Función para buscar producto por nombre
    List<Producto> buscarProductoPorNombre(String nombre);
}
package es.sportshop.repositories;
import java.util.List;
import es.sportshop.model.Producto;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;

// Anotación de Spring para indicar que es un repositorio
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    // Anptación de Spring para buscar producto por nombre
    @Query("SELECT producto FROM Producto producto WHERE producto.nombre =  :nombre")

    // Función para buscar producto por nombre
    List<Producto> buscarProductoPorNombre(String nombre);
}
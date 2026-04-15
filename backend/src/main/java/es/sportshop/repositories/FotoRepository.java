package es.sportshop.repositorios;
import es.sportshop.model.Foto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Anotación de Spring para indicar que es un repositorio
@Repository
public interface FotoRepository extends JpaRepository<Foto, Integer> {
}

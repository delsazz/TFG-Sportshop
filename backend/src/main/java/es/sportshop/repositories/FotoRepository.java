package es.sportshop.repositories;
import es.sportshop.model.Foto;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

// Anotación de Spring para indicar que es un repositorio
@Repository
public interface FotoRepository extends JpaRepository<Foto, Integer> {
}

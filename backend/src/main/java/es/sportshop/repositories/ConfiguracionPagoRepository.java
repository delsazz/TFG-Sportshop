package es.sportshop.repositories;
import es.sportshop.model.ConfiguracionPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Anotación de Spring para indicar que es un repositorio
@Repository
public interface ConfiguracionPagoRepository extends JpaRepository<ConfiguracionPago, Integer> {
}

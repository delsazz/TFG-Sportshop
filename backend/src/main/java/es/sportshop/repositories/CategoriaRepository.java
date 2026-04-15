package es.sportshop.repositories;
import es.sportshop.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
}
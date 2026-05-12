package com.tfg.sportshop.repository;
import java.util.List;
import java.util.Optional;
import com.tfg.sportshop.model.Talla;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
@Repository
public interface TallaRepository extends JpaRepository<Talla, Integer> {
    @Query("SELECT t FROM Talla t")
    List<Talla> findAllTallas();

    // Buscar talla por nombre
    Optional<Talla> findByNombre(String nombre);
    Optional<Talla> findByNombreIgnoreCase(String nombre);

    // Comprobar si existe una talla
    boolean existsByNombre(String nombre);
}

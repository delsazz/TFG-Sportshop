package com.tfg.sportshop.repository;
import java.util.List;
import java.util.Optional;
import com.tfg.sportshop.model.Categoria;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
@Repository
public interface CategoriaRepository extends JpaRepository <Categoria, Integer>{
    
    // Buscar categoría por nombre
    Optional<Categoria> findByNombreCategoria(String nombreCategoria);
    Optional<Categoria> findBySlug(String slug);

    // Comprobar si existe alguna categoria
    boolean existsByNombreCategoria(String nombreCategoria);
    boolean existsBySlug(String slug);
    boolean existsByNombreCategoriaAndIdCategoriaNot(String nombreCategoria, Integer idCategoria);
    boolean existsBySlugAndIdCategoriaNot(String slug, Integer idCategoria);
    List<Categoria> findAllByOrderByOrdenVisualizacionAscNombreCategoriaAsc();
}

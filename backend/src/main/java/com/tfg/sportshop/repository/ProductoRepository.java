package com.tfg.sportshop.repository;
import java.util.List;
import com.tfg.sportshop.model.Producto;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    @Query("SELECT DISTINCT producto FROM Producto producto LEFT JOIN FETCH producto.imagenes")
    List<Producto> findAll();
    List<Producto> findByCategoriaIdCategoria(Integer idCategoria);
    List<Producto> findByIdProductoIn(List<Integer> ids);
}

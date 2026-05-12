package com.tfg.sportshop.repository;
import java.util.List;
import org.springframework.stereotype.Repository;
import com.tfg.sportshop.model.ProductoTalla;
import com.tfg.sportshop.model.ProductoTallaId;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface ProductoTallaRepository extends JpaRepository<ProductoTalla, ProductoTallaId> {

    // Buscar todas las tallas de un producto
    List<ProductoTalla> findByProductoIdProducto(Integer idProducto);

    // Buscar todos los productos de una talla especifica
    List<ProductoTalla> findByTallaIdTalla(Integer idTalla);

    // Buscar un stock especifico de un producto y talla
    ProductoTalla findByProductoIdProductoAndTallaIdTalla(Integer idProducto, Integer idTalla);

    void deleteByProductoIdProducto(Integer idProducto);
}

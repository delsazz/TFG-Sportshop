package com.tfg.sportshop.repository;

import java.util.List;
import com.tfg.sportshop.model.ProductoImagen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoImagenRepository extends JpaRepository<ProductoImagen, Integer> {
    List<ProductoImagen> findByProductoIdProductoOrderByOrden(Integer idProducto);
    
    ProductoImagen findByProductoIdProductoAndEsPrincipal(Integer idProducto, Boolean esPrincipal);
}

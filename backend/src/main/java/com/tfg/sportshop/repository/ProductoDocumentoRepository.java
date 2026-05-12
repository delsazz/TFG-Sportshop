package com.tfg.sportshop.repository;

import java.util.List;
import com.tfg.sportshop.model.ProductoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoDocumentoRepository extends JpaRepository<ProductoDocumento, Integer> {
    List<ProductoDocumento> findByProductoIdProducto(Integer idProducto);
}


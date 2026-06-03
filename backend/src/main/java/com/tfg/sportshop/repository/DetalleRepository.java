package com.tfg.sportshop.repository;
import com.tfg.sportshop.model.Detalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface DetalleRepository extends JpaRepository<Detalle, Integer> {
    List<Detalle> findByPedido_IdPedido(Integer idPedido);
    // Check if a product has any detalle records
    boolean existsByProductoIdProducto(Integer idProducto);
    // Delete all detalle records for a given product
    @Modifying
    @Transactional
    @Query("DELETE FROM Detalle d WHERE d.producto.idProducto = :idProducto")
    void deleteByProductoIdProducto(@Param("idProducto") Integer idProducto);
}

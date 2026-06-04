package com.tfg.sportshop.repository;

import com.tfg.sportshop.model.DevolucionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface DevolucionItemRepository extends JpaRepository<DevolucionItem, Integer> {
    
    @Modifying
    @Transactional
    @Query("DELETE FROM DevolucionItem di WHERE di.detallePedido.producto.idProducto = :productoId")
    void deleteByProductoId(@Param("productoId") Integer productoId);
}

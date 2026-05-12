package com.tfg.sportshop.repository;

import com.tfg.sportshop.model.KitProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KitProductoRepository extends JpaRepository<KitProducto, Integer> {
    @Query("SELECT kp FROM KitProducto kp WHERE kp.kit.idKit = :kitId")
    List<KitProducto> findByKitId(@Param("kitId") Integer kitId);
}


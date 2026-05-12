package com.tfg.sportshop.repository;

import com.tfg.sportshop.model.Kit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KitRepository extends JpaRepository<Kit, Integer> {
    @Query("SELECT k FROM Kit k WHERE k.activo = true ORDER BY k.fechaCreacion DESC")
    List<Kit> findAllActivos();

    @Query("SELECT k FROM Kit k WHERE k.activo = true AND k.categoria.idCategoria = :categoriaId ORDER BY k.fechaCreacion DESC")
    List<Kit> findActivosByCategoria(@Param("categoriaId") Integer categoriaId);

    @Query("SELECT k FROM Kit k WHERE k.activo = true AND LOWER(k.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))")
    List<Kit> searchByNombre(@Param("nombre") String nombre);
}


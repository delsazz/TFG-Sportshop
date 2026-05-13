package com.tfg.sportshop.repository;
import com.tfg.sportshop.model.Provincia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ProvinciaRepository extends JpaRepository<Provincia, Integer> {
    List<Provincia> findByComunidadIdComunidad(Integer idComunidad);
}
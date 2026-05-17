package com.tfg.sportshop.repository;
import com.tfg.sportshop.model.Ciudad;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CiudadRepository extends JpaRepository<Ciudad, Integer> {
    List<Ciudad> findByProvinciaIdProvincia(Integer idProvincia);
}
package com.tfg.sportshop.repository;
import com.tfg.sportshop.model.ComunidadAutonoma;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ComunidadRepository extends JpaRepository<ComunidadAutonoma, Integer> {
}
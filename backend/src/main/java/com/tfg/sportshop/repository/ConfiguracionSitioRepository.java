package com.tfg.sportshop.repository;

import java.util.Optional;
import com.tfg.sportshop.model.ConfiguracionSitio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfiguracionSitioRepository extends JpaRepository<ConfiguracionSitio, Integer> {
    Optional<ConfiguracionSitio> findFirstByOrderByIdConfiguracionAsc();
}


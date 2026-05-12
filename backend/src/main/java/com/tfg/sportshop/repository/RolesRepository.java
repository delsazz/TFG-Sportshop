package com.tfg.sportshop.repository;
import java.util.Optional;
import com.tfg.sportshop.model.Roles;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
@Repository
public interface RolesRepository extends JpaRepository<Roles, Integer> {
    Optional<Roles> findByNombreRol(String nombreRol);
}
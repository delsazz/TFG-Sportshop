package com.campusfp.uniformes.repository;
import com.campusfp.uniformes.model.Foto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FotoRepository extends JpaRepository<Foto, Integer> {
}

package com.tfg.sportshop.repository;

import com.tfg.sportshop.model.CarritoItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarritoItemRepository extends JpaRepository<CarritoItem, Integer> {
    List<CarritoItem> findByUsuarioIdUsuarioOrderByIdCarritoItemAsc(Integer idUsuario);
    void deleteByUsuarioIdUsuario(Integer idUsuario);
}

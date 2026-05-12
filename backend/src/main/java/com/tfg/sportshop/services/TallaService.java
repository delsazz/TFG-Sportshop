package com.tfg.sportshop.services;

import java.util.List;
import java.util.Optional;
import com.tfg.sportshop.model.Talla;
import org.springframework.stereotype.Service;
import com.tfg.sportshop.repository.TallaRepository;
import org.springframework.beans.factory.annotation.Autowired;
@Service
public class TallaService {
    @Autowired
    private TallaRepository tallaRepository;
    public List<Talla> verTallas() {
        return tallaRepository.findAllTallas();
    }
    public Optional<Talla> buscarTallas(String nombre) {
        return tallaRepository.findByNombre(nombre);
    }
    public boolean comprobarTallaPorNombre(String nombre) {
        return tallaRepository.existsByNombre(nombre);
    }
}
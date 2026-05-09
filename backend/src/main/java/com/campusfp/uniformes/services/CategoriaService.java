package com.campusfp.uniformes.services;
import com.campusfp.uniformes.model.Categoria;
import com.campusfp.uniformes.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {
    @Autowired
    private CategoriaRepository categoriaRepository;

    public List<Categoria> obtenerTodas() {
        return categoriaRepository.findAll();
    }

    public Optional<Categoria> obtenerPorId(Integer id) {
        return categoriaRepository.findById(id);
    }

    public Categoria guardar(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    public void eliminar(Integer id) {
        categoriaRepository.deleteById(id);
    }
}

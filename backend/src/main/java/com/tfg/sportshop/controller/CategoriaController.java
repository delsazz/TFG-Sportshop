package com.tfg.sportshop.controller;

import java.util.List;
import com.tfg.sportshop.model.Categoria;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.tfg.sportshop.services.CategoriaService;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api")
public class CategoriaController {
    @Autowired
    private CategoriaService categoriaService;

    @GetMapping("/categorias")
    public ResponseEntity<List<Categoria>> getAllCategorias() {
        return ResponseEntity.ok(categoriaService.verCategorias());
    }

    @GetMapping("/categorias/{id}")
    public ResponseEntity<Categoria> getCategoria(@PathVariable Integer id) {
        return categoriaService.buscarCategoriaPorId(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());                    
    }
}
package com.tfg.sportshop.controller;

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

    @GetMapping("/categorias/{idCategoria}")
    public ResponseEntity<Categoria> getCategoria(@PathVariable Integer idCategoria) {
        return categoriaService.buscarCategoriaPorId(idCategoria).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());                    
    }
}

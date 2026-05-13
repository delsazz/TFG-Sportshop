package com.tfg.sportshop.controller;
import com.tfg.sportshop.dto.lugares.ProvinciaDTO;
import com.tfg.sportshop.services.ProvinciaService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/provincias")
@CrossOrigin(origins = "*")
public class ProvinciaController {
    private final ProvinciaService provinciaService;

    public ProvinciaController(ProvinciaService provinciaService) {
        this.provinciaService = provinciaService;
    }

    @GetMapping("/por/comunidad/{idComunidad}")
    public List<ProvinciaDTO> getByComunidad(@PathVariable Integer idComunidad) {
        return provinciaService.getByComunidad(idComunidad);
    }
}
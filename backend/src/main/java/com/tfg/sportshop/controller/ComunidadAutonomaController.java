package com.tfg.sportshop.controller;
import com.tfg.sportshop.dto.lugares.ComunidadAutonomaDTO;
import com.tfg.sportshop.services.ComunidadAutonomaService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/comunidades")
@CrossOrigin(origins = "*")
public class ComunidadAutonomaController {
    private final ComunidadAutonomaService comunidadAutonomaService;
    public ComunidadAutonomaController(ComunidadAutonomaService comunidadAutonomaService) {
        this.comunidadAutonomaService = comunidadAutonomaService;
    }
    @GetMapping("/")
    public List<ComunidadAutonomaDTO> getAll() {
        return service.getAll();
    }
}
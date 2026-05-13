package com.tfg.sportshop.controller;
import com.tfg.sportshop.dto.lugares.CiudadDTO;
import com.tfg.sportshop.services.CiudadService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ciudades")
@CrossOrigin(origins = "*")
public class CiudadController {
    private final CiudadService ciudadService;
    public CiudadController(CiudadService ciudadService) {
        this.ciudadService = ciudadService;
    }

    @GetMapping("/por/provincia/{idProvincia}")
    public List<CiudadDTO> getByProvincia(@PathVariable Integer idProvincia) {
        return ciudadService.getByProvincia(idProvincia);
    }
}
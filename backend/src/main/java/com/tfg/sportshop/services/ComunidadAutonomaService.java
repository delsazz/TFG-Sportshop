package com.tfg.sportshop.services;
import com.tfg.sportshop.dto.ubicacion.ComunidadDTO;
import com.tfg.sportshop.repository.ComunidadAutonomaRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ComunidadAutonomaService {

    private final ComunidadAutonomaRepository conunidadAutonomaRepository;

    public ComunidadAutonomaService(ComunidadAutonomaRepository conunidadAutonomaRepository) {
        this.conunidadAutonomaRepository = conunidadAutonomaRepository;
    }

    public List<ComunidadDTO> getAll() {
        return conunidadAutonomaRepository.findAll()
                .stream()
                .map(c -> new ComunidadDTO(
                        c.getIdComunidad(),
                        c.getNombre()
                ))
                .toList();
    }
}
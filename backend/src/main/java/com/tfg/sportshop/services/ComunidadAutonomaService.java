package com.tfg.sportshop.services;
import java.util.List;
import org.springframework.stereotype.Service;
import com.tfg.sportshop.dto.lugares.ComunidadAutonomaDTO;
import com.tfg.sportshop.repository.ComunidadAutonomaRepository;

@Service
public class ComunidadAutonomaService {
    private final ComunidadAutonomaRepository conunidadAutonomaRepository;
    public ComunidadAutonomaService(ComunidadAutonomaRepository conunidadAutonomaRepository) {
        this.conunidadAutonomaRepository = conunidadAutonomaRepository;
    }

    public List<ComunidadAutonomaDTO> getAll() {
        return conunidadAutonomaRepository.findAll()
                .stream()
                .map(c -> new ComunidadAutonomaDTO(
                        c.getIdComunidad(),
                        c.getNombre()
                ))
                .toList();
    }
}
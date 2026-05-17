package com.tfg.sportshop.services;
import com.tfg.sportshop.dto.lugares.ProvinciaDTO;
import com.tfg.sportshop.repository.ProvinciaRepository;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class ProvinciaService {
    private final ProvinciaRepository provinciaRepository;
    public ProvinciaService(ProvinciaRepository provinciaRepository) {
        this.provinciaRepository = provinciaRepository;
    }
    public List<ProvinciaDTO> getByComunidad(Integer idComunidad) {
        return provinciaRepository.findByComunidadIdComunidad(idComunidad)
                .stream()
                .map(p -> new ProvinciaDTO(
                        p.getIdProvincia(),
                        p.getNombre(),
                        p.getComunidad().getIdComunidad()
                ))
                .toList();
    }
}
package com.tfg.sportshop.services;
import com.tfg.sportshop.dto.lugares.CiudadDTO;
import com.tfg.sportshop.repository.CiudadRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CiudadService {
    private final CiudadRepository ciudadRepository;
    public CiudadService(CiudadRepository ciudadRepository) {
        this.ciudadRepository = ciudadRepository;
    }

    public List<CiudadDTO> getByProvincia(Integer idProvincia) {
        return ciudadRepository.findByProvinciaIdProvincia(idProvincia)
                .stream()
                .map(m -> new CiudadDTO(
                        m.getIdMunicipio(),
                        m.getNombre(),
                        m.getProvincia().getIdProvincia()
                ))
                .toList();
    }
}
package com.tfg.sportshop.services;

import org.springframework.stereotype.Service;
import com.tfg.sportshop.dto.pagos.PagoConfiguracionResponse;

@Service
public class PagoConfiguracionService {
    private final ConfiguracionSitioService configuracionSitioService;

    public PagoConfiguracionService(ConfiguracionSitioService configuracionSitioService) {
        this.configuracionSitioService = configuracionSitioService;
    }

    public PagoConfiguracionResponse obtenerConfiguracion() {
        var configuracion = configuracionSitioService.obtenerConfiguracion();
        return new PagoConfiguracionResponse(
            configuracion.tarjetaHabilitada()
        );
    }
}

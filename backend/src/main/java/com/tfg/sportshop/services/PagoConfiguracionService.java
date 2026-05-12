package com.tfg.sportshop.services;

import com.tfg.sportshop.dto.pagos.PagoConfiguracionResponse;
import org.springframework.stereotype.Service;

@Service
public class PagoConfiguracionService {
    private final ConfiguracionSitioService configuracionSitioService;

    public PagoConfiguracionService(ConfiguracionSitioService configuracionSitioService) {
        this.configuracionSitioService = configuracionSitioService;
    }

    public PagoConfiguracionResponse obtenerConfiguracion() {
        var configuracion = configuracionSitioService.obtenerConfiguracion();
        return new PagoConfiguracionResponse(
            configuracion.bizumTelefono(),
            configuracion.bizumBancoUrl(),
            configuracion.transferenciaTitular(),
            configuracion.transferenciaIban(),
            configuracion.transferenciaConcepto(),
            configuracion.transferenciaNotas(),
            configuracion.tarjetaHabilitada(),
            configuracion.bizumHabilitado(),
            configuracion.transferenciaHabilitada(),
            configuracion.mostradorHabilitado()
        );
    }
}

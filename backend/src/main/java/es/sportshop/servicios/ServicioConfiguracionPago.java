package es.sportshop.servicios;
import es.sportshop.model.ConfiguracionPago;
import es.sportshop.repositories.ConfiguracionPagoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// Anotación de Spring para crear un bean
@Service
public class ServicioConfiguracionPago {

    private static final int ID_CONFIGURACION = 1;

    // Anotación de Spring para inyección de dependencias
    @Autowired
    private ConfiguracionPagoRepository configuracionPagoRepository;

    // Función para obtener la configuración de pagos
    public ConfiguracionPago obtenerConfiguracion() {
        return configuracionPagoRepository.findById(ID_CONFIGURACION).orElseGet(this::crearConfiguracionInicial);
    }

    // Función para guardar la configuración de pagos
    public ConfiguracionPago guardarConfiguracion(ConfiguracionPago configuracionPago) {
        configuracionPago.setId(ID_CONFIGURACION);
        return configuracionPagoRepository.save(configuracionPago);
    }

    private ConfiguracionPago crearConfiguracionInicial() {
        ConfiguracionPago configuracionPago = new ConfiguracionPago();
        configuracionPago.setId(ID_CONFIGURACION);
        configuracionPago.setTelefonoBizum("600123456");
        configuracionPago.setUrlBancoBizum("https://www.caixabank.es/particular/home/particulares_es.html");
        configuracionPago.setTitularTransferencia("SportShop");
        configuracionPago.setIbanTransferencia("ES7620770024003102575766");
        configuracionPago.setConceptoTransferencia("Pedido SportShop");
        configuracionPago.setStripePublicKey("");
        configuracionPago.setStripeSecretKey("");
        return configuracionPagoRepository.save(configuracionPago);
    }
}

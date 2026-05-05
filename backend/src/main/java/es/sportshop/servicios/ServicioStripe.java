package es.sportshop.servicios;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import es.sportshop.model.ConfiguracionPago;
import org.springframework.stereotype.Service;

// Anotación de Spring para crear un bean
@Service
public class ServicioStripe {

    private final ServicioConfiguracionPago servicioConfiguracionPago;

    public ServicioStripe(ServicioConfiguracionPago servicioConfiguracionPago) {
        this.servicioConfiguracionPago = servicioConfiguracionPago;
    }

    // Función para crear una sesión de pago con Stripe Checkout
    public Session crearSesionPago(String emailCliente, int total, String successUrl, String cancelUrl) throws StripeException {
        ConfiguracionPago configuracionPago = servicioConfiguracionPago.obtenerConfiguracion();
        String stripeSecretKey = configuracionPago.getStripeSecretKey();
        if(stripeSecretKey == null || stripeSecretKey.isBlank()) {
            throw new IllegalStateException("Stripe no está configurado en el panel de administración");
        }

        Stripe.apiKey = stripeSecretKey;
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .setCustomerEmail(emailCliente)
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("eur")
                                .setUnitAmount((long) total * 100)
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Pedido SportShop")
                                        .build())
                                .build())
                        .build())
                .build();
        return Session.create(params);
    }
}

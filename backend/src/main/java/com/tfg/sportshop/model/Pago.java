package com.tfg.sportshop.model;
import lombok.*;
import java.time.LocalDate;
import java.math.BigDecimal;
import jakarta.persistence.*;
@Entity
@Table(name = "pago")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idPago;
    @Column(name = "metodo_pago", nullable = false, length = 50)
    private String metodoPago;
    @Column(name = "fecha_pago", nullable = false)
    private LocalDate fechaPago;
    @Column(name = "monto", nullable = false)
    private BigDecimal monto;
    @Column(name = "estado", nullable = false, length = 50)
    private String estado;
    @Column(name = "comprobante_url")
    private String comprobanteUrl;
    @Column(name = "comprobante_nombre_archivo")
    private String comprobanteNombreArchivo;
    @Column(name = "fecha_confirmacion")
    private LocalDate fechaConfirmacion;
    @Column(name = "notas_admin", length = 500)
    private String notasAdmin;
    @Column(name = "stripe_session_id", unique = true)
    private String stripeSessionId;
    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;
    @Column(name = "stripe_checkout_url", length = 1000)
    private String stripeCheckoutUrl;
    @Column(name = "stripe_event_id")
    private String stripeEventId;
    @ManyToOne
    @JoinColumn(name = "id_pedido")
    private Pedido pedido;
}

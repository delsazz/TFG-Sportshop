package com.campusfp.uniformes.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pago")
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Integer idPago;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido")
    private Pedido pedido;

    @Column(name = "stripe_session_id")
    private String stripeSessionId;

    @Column(name = "estado", length = 50)
    private String estado = "PENDIENTE";

    @Column(name = "monto", nullable = false)
    private Integer monto;

    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    public Pago() {}

    public Pago(Integer idPago, Pedido pedido, String stripeSessionId, String estado, Integer monto, LocalDateTime fechaPago) {
        this.idPago = idPago;
        this.pedido = pedido;
        this.stripeSessionId = stripeSessionId;
        this.estado = estado;
        this.monto = monto;
        this.fechaPago = fechaPago;
    }

    public Integer getIdPago() { return idPago; }
    public void setIdPago(Integer idPago) { this.idPago = idPago; }

    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }

    public String getStripeSessionId() { return stripeSessionId; }
    public void setStripeSessionId(String stripeSessionId) { this.stripeSessionId = stripeSessionId; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Integer getMonto() { return monto; }
    public void setMonto(Integer monto) { this.monto = monto; }

    public LocalDateTime getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }
}

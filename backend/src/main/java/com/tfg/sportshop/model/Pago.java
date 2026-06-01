package com.tfg.sportshop.model;
import lombok.*;
import java.time.LocalDateTime;
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
    @Column(name = "fecha_pago", nullable = false)
    private LocalDateTime fechaPago;
    @Column(name = "monto", nullable = false)
    private BigDecimal monto;
    @Column(name = "estado", nullable = false, length = 50)
    private String estado;
    @ManyToOne
    @JoinColumn(name = "id_pedido")
    private Pedido pedido;
}

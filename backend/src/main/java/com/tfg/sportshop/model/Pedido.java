package com.tfg.sportshop.model;
import lombok.*;
import java.util.List;
import java.time.LocalDate;
import java.math.BigDecimal;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Integer idPedido;
    @Column(name = "fecha_pedido", nullable = false)
    private LocalDateTime fechaPedido;
    @Column(name = "total", nullable = false)
    private BigDecimal total;
    @Column(name = "estado", nullable = false, length = 50)
    private String estado;
    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;
    @OneToMany(mappedBy = "pedido")
    private List<DetallePedido> detalles;
    @OneToMany(mappedBy = "pedido")
    private List<Pago> pagos;

    public EstadoPedido getEstadoEnum() {
        return EstadoPedido.fromValor(this.estado);
    }

    public void setEstadoEnum(EstadoPedido estado) {
        this.estado = estado.getValor();
    }

    public boolean esTransicionValida(EstadoPedido nuevoEstado) {
        EstadoPedido estadoActual = getEstadoEnum();
        switch (estadoActual) {
            case PENDIENTE:
                return nuevoEstado == EstadoPedido.PAGADO ||
                       nuevoEstado == EstadoPedido.EN_PREPARACION ||
                       nuevoEstado == EstadoPedido.ENTREGADO_PARCIAL ||
                       nuevoEstado == EstadoPedido.ENTREGADO_COMPLETO ||
                       nuevoEstado == EstadoPedido.CANCELADO;
            case PAGADO:
                return nuevoEstado == EstadoPedido.EN_PREPARACION ||
                       nuevoEstado == EstadoPedido.ENVIADO ||
                       nuevoEstado == EstadoPedido.ENTREGADO_PARCIAL ||
                       nuevoEstado == EstadoPedido.ENTREGADO_COMPLETO ||
                       nuevoEstado == EstadoPedido.CANCELADO;
            case EN_PREPARACION:
                return nuevoEstado == EstadoPedido.ENVIADO ||
                       nuevoEstado == EstadoPedido.ENTREGADO_PARCIAL ||
                       nuevoEstado == EstadoPedido.ENTREGADO_COMPLETO ||
                       nuevoEstado == EstadoPedido.CANCELADO;
            case ENVIADO:
                return nuevoEstado == EstadoPedido.ENTREGADO_PARCIAL ||
                       nuevoEstado == EstadoPedido.ENTREGADO_COMPLETO;
            case ENTREGADO_PARCIAL:
                return nuevoEstado == EstadoPedido.ENTREGADO_COMPLETO;
            case ENTREGADO_COMPLETO:
            case CANCELADO:
                return false;
            default:
                return false;
        }
    }
}

package com.tfg.sportshop.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;

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

    @Column(name = "fecha_entrega")
    private LocalDate fechaEntrega;

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

    // Explicit getters and setters for services (Lombok also generates them)
    public Integer getIdPedido() { return idPedido; }
    public void setIdPedido(Integer idPedido) { this.idPedido = idPedido; }
    public LocalDateTime getFechaPedido() { return fechaPedido; }
    public void setFechaPedido(LocalDateTime fechaPedido) { this.fechaPedido = fechaPedido; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public List<DetallePedido> getDetalles() { return detalles; }
    public void setDetalles(List<DetallePedido> detalles) { this.detalles = detalles; }
    public List<Pago> getPagos() { return pagos; }
    public void setPagos(List<Pago> pagos) { this.pagos = pagos; }

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

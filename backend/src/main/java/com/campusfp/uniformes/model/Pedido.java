package com.campusfp.uniformes.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "pedido")
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Integer idPedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "correo_electronico")
    private Usuario usuario;

    @Column(name = "fecha_pedido")
    private LocalDate fechaPedido;

    @Column(name = "fecha_entrega")
    private LocalDate fechaEntrega;

    @Column(name = "estado", length = 50)
    private String estado = "PENDIENTE";

    @Column(name = "total")
    private Integer total = 0;

    public Pedido() {}

    public Pedido(Integer idPedido, Usuario usuario, LocalDate fechaPedido, LocalDate fechaEntrega, String estado, Integer total) {
        this.idPedido = idPedido;
        this.usuario = usuario;
        this.fechaPedido = fechaPedido;
        this.fechaEntrega = fechaEntrega;
        this.estado = estado;
        this.total = total;
    }

    public Integer getIdPedido() { return idPedido; }
    public void setIdPedido(Integer idPedido) { this.idPedido = idPedido; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public LocalDate getFechaPedido() { return fechaPedido; }
    public void setFechaPedido(LocalDate fechaPedido) { this.fechaPedido = fechaPedido; }

    public LocalDate getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(LocalDate fechaEntrega) { this.fechaEntrega = fechaEntrega; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }
}

package com.tfg.sportshop.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "backorder_pedido")
public class BackorderPedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idBackorder;

    @Column(name = "id_detalle", nullable = false)
    private Integer idDetalle;

    @Column(name = "id_pedido", nullable = false)
    private Integer idPedido;

    @Column(name = "id_producto", nullable = false)
    private Integer idProducto;

    @Column(name = "id_talla")
    private Integer idTalla;

    @Column(name = "cantidad_faltante", nullable = false)
    private Integer cantidadFaltante;

    @Column(name = "cantidad_recibida_parcial", nullable = false)
    private Integer cantidadRecibidaParcial = 0;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_resuelto")
    private LocalDateTime fechaResuelto;

    @Column(name = "estado", nullable = false, length = 50)
    private String estado = "PENDIENTE";

    @Column(name = "observaciones", length = 500)
    private String observaciones;

    public BackorderPedido() {}

    public BackorderPedido(Integer idDetalle, Integer idPedido, Integer idProducto,
                          Integer idTalla, Integer cantidadFaltante) {
        this.idDetalle = idDetalle;
        this.idPedido = idPedido;
        this.idProducto = idProducto;
        this.idTalla = idTalla;
        this.cantidadFaltante = cantidadFaltante;
        this.cantidadRecibidaParcial = 0;
        this.fechaCreacion = LocalDateTime.now();
        this.estado = "PENDIENTE";
    }

    // Getters and Setters
    public Integer getIdBackorder() {
        return idBackorder;
    }

    public void setIdBackorder(Integer idBackorder) {
        this.idBackorder = idBackorder;
    }

    public Integer getIdDetalle() {
        return idDetalle;
    }

    public void setIdDetalle(Integer idDetalle) {
        this.idDetalle = idDetalle;
    }

    public Integer getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(Integer idPedido) {
        this.idPedido = idPedido;
    }

    public Integer getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(Integer idProducto) {
        this.idProducto = idProducto;
    }

    public Integer getIdTalla() {
        return idTalla;
    }

    public void setIdTalla(Integer idTalla) {
        this.idTalla = idTalla;
    }

    public Integer getCantidadFaltante() {
        return cantidadFaltante;
    }

    public void setCantidadFaltante(Integer cantidadFaltante) {
        this.cantidadFaltante = cantidadFaltante;
    }

    public Integer getCantidadRecibidaParcial() {
        return cantidadRecibidaParcial;
    }

    public void setCantidadRecibidaParcial(Integer cantidadRecibidaParcial) {
        this.cantidadRecibidaParcial = cantidadRecibidaParcial;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaResuelto() {
        return fechaResuelto;
    }

    public void setFechaResuelto(LocalDateTime fechaResuelto) {
        this.fechaResuelto = fechaResuelto;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}


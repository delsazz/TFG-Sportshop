package com.tfg.sportshop.model;

import lombok.*;
import java.math.BigDecimal;
import jakarta.persistence.*;

@Entity
@Table(name = "detalle_pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetallePedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Integer idDetalle;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "cantidad_satisfecha", nullable = false)
    private Integer cantidadSatisfecha = 0;

    @Column(name = "cantidad_pendiente", nullable = false)
    private Integer cantidadPendiente = 0;

    @Column(name = "es_backorder", nullable = false)
    private Boolean esBackorder = false;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(name = "id_talla")
    private Integer idTalla;

    @ManyToOne
    @JoinColumn(name = "id_pedido", nullable = false)
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "id_talla", insertable = false, updatable = false)
    private Talla talla;
}
import lombok.*;
import java.math.BigDecimal;
import jakarta.persistence.*;
    // Explicit getters and setters
    public Integer getIdDetalle() { return idDetalle; }
    public void setIdDetalle(Integer idDetalle) { this.idDetalle = idDetalle; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    public Integer getCantidadSatisfecha() { return cantidadSatisfecha; }
    public void setCantidadSatisfecha(Integer cantidadSatisfecha) { this.cantidadSatisfecha = cantidadSatisfecha; }
    public Integer getCantidadPendiente() { return cantidadPendiente; }
    public void setCantidadPendiente(Integer cantidadPendiente) { this.cantidadPendiente = cantidadPendiente; }
    public Boolean getEsBackorder() { return esBackorder; }
    public void setEsBackorder(Boolean esBackorder) { this.esBackorder = esBackorder; }
    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
    public Integer getIdTalla() { return idTalla; }
    public void setIdTalla(Integer idTalla) { this.idTalla = idTalla; }
    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }
    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }
    public Talla getTalla() { return talla; }
    public void setTalla(Talla talla) { this.talla = talla; }
@Table(name = "detalle_pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetallePedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Integer idDetalle;
    
    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "cantidad_satisfecha", nullable = false)
    private Integer cantidadSatisfecha = 0;

    @Column(name = "cantidad_pendiente", nullable = false)
    private Integer cantidadPendiente = 0;

    @Column(name = "es_backorder", nullable = false)
    private Boolean esBackorder = false;
    
    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;
    
    @Column(name = "id_talla")
    private Integer idTalla;
    
    @ManyToOne
    @JoinColumn(name = "id_pedido", nullable = false)
    private Pedido pedido;
    
    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;
    
    @ManyToOne
    @JoinColumn(name = "id_talla", insertable = false, updatable = false)
    private Talla talla;
}

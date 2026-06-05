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

    @Column(name = "precio")
    private Integer precio;

    @Column(name = "unidades")
    private Integer unidades;

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

package com.tfg.sportshop.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "proveedor_pedido_linea")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProveedorPedidoLinea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_linea_proveedor")
    private Integer idLineaProveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido_proveedor", nullable = false)
    private ProveedorPedido pedidoProveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_talla")
    private Talla tallaEntidad;

    @Column(name = "referencia_proveedor")
    private String referenciaProveedor;

    @Column(name = "nombre_producto", nullable = false)
    private String nombreProducto;

    @Column(name = "talla")
    private String talla;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "stock_disponible", nullable = false)
    private Integer stockDisponible;

    @Column(name = "pendiente_entrega", nullable = false)
    private Integer pendienteEntrega;

    @Column(name = "stock_proyectado", nullable = false)
    private Integer stockProyectado;

    @Column(name = "prioridad", nullable = false)
    private String prioridad;
}

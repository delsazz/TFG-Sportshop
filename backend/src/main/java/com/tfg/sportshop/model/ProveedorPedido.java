package com.tfg.sportshop.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "proveedor_pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProveedorPedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido_proveedor")
    private Integer idPedidoProveedor;

    @Column(name = "proveedor", nullable = false)
    private String proveedor;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "estado", nullable = false)
    private String estado;

    @Column(name = "observaciones", length = 500)
    private String observaciones;

    @Column(name = "direccion_entrega")
    private String direccionEntrega;

    @Column(name = "contacto_entrega")
    private String contactoEntrega;

    @Column(name = "telefono_entrega")
    private String telefonoEntrega;

    @Column(name = "fecha_prevista_entrega")
    private LocalDate fechaPrevistaEntrega;

    @Column(name = "fecha_recepcion")
    private LocalDateTime fechaRecepcion;

    @OneToMany(mappedBy = "pedidoProveedor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProveedorPedidoLinea> lineas;
}

package com.tfg.sportshop.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pedido_entrega_linea")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoEntregaLinea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_entrega_linea")
    private Integer idEntregaLinea;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_entrega", nullable = false)
    private PedidoEntrega entrega;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_detalle", nullable = false)
    private DetallePedido detalle;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "estado_entrega", nullable = false)
    private String estadoEntrega;
}

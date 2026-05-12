package com.tfg.sportshop.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "devolucion_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DevolucionItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_devolucion_item")
    private Integer idDevolucionItem;

    @ManyToOne
    @JoinColumn(name = "id_devolucion", nullable = false)
    @JsonIgnore
    private Devolucion devolucion;

    @ManyToOne
    @JoinColumn(name = "id_detalle_pedido", nullable = false)
    private DetallePedido detallePedido;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;
}

package com.tfg.sportshop.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "kit_producto")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KitProducto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_kit_producto")
    private Integer idKitProducto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_kit", nullable = false)
    private Kit kit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad = 1;
}


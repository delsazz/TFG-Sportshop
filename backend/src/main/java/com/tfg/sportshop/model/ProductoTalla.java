package com.tfg.sportshop.model;
import lombok.*;
import jakarta.persistence.*;
@Entity
@Table(name = "producto_talla")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoTalla {
    @EmbeddedId
    private ProductoTallaId id;
    
    @Column(name = "stock")
    private Integer stock;
    
    @ManyToOne
    @MapsId("idProducto")
    @JoinColumn(name = "id_producto")
    private Producto producto;

    @ManyToOne
    @MapsId("idTalla")
    @JoinColumn(name = "id_talla")
    private Talla talla;
}
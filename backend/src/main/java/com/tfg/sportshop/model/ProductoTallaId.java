package com.tfg.sportshop.model;
import lombok.*;
import java.io.Serializable;
import jakarta.persistence.*;
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ProductoTallaId implements Serializable {
    @Column(name = "id_producto")
    private Integer idProducto;
    @Column(name = "id_talla")
    private Integer idTalla;
}
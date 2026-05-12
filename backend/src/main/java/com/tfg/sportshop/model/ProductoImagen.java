package com.tfg.sportshop.model;
import lombok.*;
import jakarta.persistence.*;
@Entity
@Table(name = "producto_imagen")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoImagen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_imagen")
    private int idImagen;
    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;
    @Column(name = "url_imagen", nullable = false, length = 255)
    private String urlImagen;
    @Column(name = "alt_text", length = 255)
    private String altText;
    @Column(name = "orden")
    private int orden = 0;
    @Column(name = "es_principal")
    private Boolean esPrincipal = false;
}
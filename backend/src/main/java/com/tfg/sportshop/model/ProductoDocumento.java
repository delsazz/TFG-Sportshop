package com.tfg.sportshop.model;
import lombok.*;
import jakarta.persistence.*;
@Entity
@Table(name = "producto_documento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoDocumento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_documento")
    private int idDocumento;
    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Producto producto;
    @Column(name = "nombre", nullable = false, length = 255)
    private String nombre;
    @Column(name = "url_documento", nullable = false, length = 255)
    private String urlDocumento;
    @Column(name = "tipo", length = 50)
    private String tipo = "ficha_tecnica";
}
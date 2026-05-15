package com.tfg.sportshop.model;
import lombok.*;
import java.util.List;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity
@Table(name = "categoria")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCategoria;
    @Column(name = "categoria", nullable = false, length = 100)
    private String nombreCategoria;
    @Column(nullable = false, length = 120, unique = true)
    private String slug;
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    @Column(name = "imagen_url", columnDefinition = "TEXT")
    private String imagenUrl;
    @Column(name = "orden_visualizacion", nullable = false)
    private Integer ordenVisualizacion;
    @OneToMany(mappedBy = "categoria", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Producto> productos;
}

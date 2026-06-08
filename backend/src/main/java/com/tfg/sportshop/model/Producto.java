package com.tfg.sportshop.model;
import lombok.*;
import java.util.List;
import java.math.BigDecimal;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

// Anotación de Spring para indicar que es una clase de entidad
@Entity

// Anotación de Spring para indicar el nombre de la tabla
@Table(name = "producto")

// Anotación de Lombok para generar getters, setters, toString, equals y hashCode
@Data

// Anotación de Lombok para crear un constructor vacío para la clase Producto
@NoArgsConstructor

// Anotación de Lombok para crear un cosntructor con parámetros para la clase Priducto
@AllArgsConstructor
public class Producto {

    // Anotación de Spring para indicar que es PK
    @Id

    // Anotación de Spring para indicar que el ID es autoincremental
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "id_producto")
    private Integer idProducto;

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "stock")
    private Integer stock;

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "proveedor", length = 150)
    private String proveedor;

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "referencia_proveedor", length = 80)
    private String referenciaProveedor;

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "stock_minimo")
    private Integer stockMinimo;

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "lote_compra")
    private Integer loteCompra;

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "plazo_reposicion_dias")
    private Integer plazoReposicionDias;

    // Anotación de Spring para indicar relación muchos a uno
    @ManyToOne

    // Anotación de Spring para indicar la FK
    @JoinColumn(name = "id_categoria", nullable = true)
    private Categoria categoria;

    // Anotación de Spring para indicar relación uno a muchos
    @OneToMany(mappedBy = "producto", fetch = FetchType.LAZY)

    // Anotación para ignorar JSON
    @JsonIgnore
    private List<DetallePedido> detalles;

    // Anotación de Spring para indicar el nombre de la columna
    @Column(length = 500)
    private String descripcion;

    // Anotación de Spring para indicar relación uno a muchos
    @OneToMany(mappedBy = "producto", fetch = FetchType.LAZY)
    private List<ProductoImagen> imagenes;
}
package com.tfg.sportshop.model;
import lombok.*;
import java.util.List;
import java.math.BigDecimal;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity
@Table(name = "producto")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idProducto;
    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;
    @Column(name = "tipo_prenda", length = 50)
    private String tipoPrenda;   
    @Column(name = "color", length = 50)
    private String color;
    @Column(name = "precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;
    @Column(name = "stock")
    private Integer stock;
    @Column(name = "proveedor", length = 150)
    private String proveedor;
    @Column(name = "referencia_proveedor", length = 80)
    private String referenciaProveedor;
    @Column(name = "stock_minimo")
    private Integer stockMinimo;
    @Column(name = "lote_compra")
    private Integer loteCompra;
    @Column(name = "plazo_reposicion_dias")
    private Integer plazoReposicionDias;
    @ManyToOne
    @JoinColumn(name = "id_categoria", nullable = true)
    private Categoria categoria;
    @OneToMany(mappedBy = "producto", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<DetallePedido> detalles;
    @Column(name = "imagen", length = 255)
    private String imagen;
    @Column(length = 500)
    private String descripcion;
    @Column(columnDefinition = "TEXT")
    private String consejos;
    @Column(length = 255)
    private String composicion;
    @Column(length = 255)
    private String normativa;
    @Column(name = "instrucciones_lavado", length = 255)
    private String instruccionesLavado;
    @OneToMany(mappedBy = "producto", fetch = FetchType.LAZY)
    private List<ProductoImagen> imagenes;
    @OneToMany(mappedBy = "producto", fetch = FetchType.LAZY)
    private List<ProductoDocumento> documentos;
}

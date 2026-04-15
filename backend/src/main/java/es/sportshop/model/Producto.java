package es.sportshop.model;
import jakarta.persistence.*;
import java.util.List;

// Anotación de Spring para indicar que es una clase de entidad
@Entity

// Anotación de Spring para indicar el nombre de la tabla a la que hace referencia esta clase de entidad
@Table(name = "producto")
public class Producto {

    // Anotación de Spring para indicar que es la Primary Key
    @Id

    // Anotación de Spring para que el valor se genere automáicamente
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "id_producto")

    // Atributos para la clase Producto
    private int idProducto;
    private String nombre;
    private int precio;
    private int stock;
    private String descripcion;

    // Anotación de Spring para indicar la relación de los productos con las categorías
    @ManyToOne

    // Anotación de Spring para indicar la columna a la que hace referencia (FK)
    @JoinColumn(name = "id_categoria")
    private Categoria categoria;

    // Anotación de Spring para indicar la relación de los productos con el detalle
    @OneToMany(mappedBy = "producto")
    private List<Detalle> detalles;

    // Anotación de Spring para indicar la relación de los productos con las fotos
    @OneToOne
    @JoinColumn(name = "id_foto")
    private Foto foto;


    // Getters y setters para obtener datos de los productos
    public void setIdProducto(int idProducto) {
        this.idProducto = idProducto;
    }
    public int getIdProducto() {
        return idProducto;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    public String getNombre() {
        return nombre;
    }
    public void setPrecio(int precio) {
        this.precio = precio;
    }
    public int getPrecio() {
        return precio;
    }
    public void setStock(int stock) {
        this.stock = stock;
    }
    public int getStock() {
        return stock;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public void  setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }
    public Categoria getCategoria() {
        return categoria;
    }
    public void setDetalles(List<Detalle> detalles) {
        this.detalles = detalles;
    }
    public List<Detalle> getDetalles() {
        return detalles;
    }
    public void setFoto(Foto foto) {
        this.foto = foto;
    }
    public Foto getFoto() {
        return foto;
    }
}
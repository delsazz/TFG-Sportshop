package es.sportshop.model;
import jakarta.persistence.*;
import java.util.List;

// Anotación de Spring para indicar que es una clase de entidad
@Entity

// Anotación de Spring para indicar el nombre de la tabla a la que hace referencia esta clase de entidad
@Table(name = "categoria")
public class Categoria {

    // Anotación de Spring para indicar que es la Primary Key
    @Id

    // Anotación de Spring para que el valor se genere automáicamente
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "id_categoria")
    private int idCategoria;

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "categoria")
    private String categoria;

    // Anotación de Spring para indicar la relación de los categorías con los productos
    @OneToMany(mappedBy = "categoria")
    private List<Producto> productos;

    // Usar getters y setters para obtener datos de las categorias
    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }
    public String getCategoria() {
        return categoria;
    }
    public void setProductos(List<Producto> productos) {
        this.productos = productos;
    }
    public List<Producto> getProductos() {
        return productos;
    }
}
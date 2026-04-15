package es.sportshop.model;
import jakarta.persistence.*;

// Anotación de Spring para indicar que es una clase de entidad
@Entity

// Anotación de Spring para indicar el nombre de la tabla a la que hace referencia esta clase de entidad
@Table(name = "detalle")
public class Detalle {

    // Anotación de Spring para indicar que es la Primary Key
    @Id

    // Anotación de Spring para que el valor se genere automáicamente
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "id_detalle")

    // Atributos para la clase Detalle
    private int idDetalle;
    private int precio;
    private int unidades;

    // Anotación de Spring para indicar la relación del detalle con los pedidos
    @ManyToOne

    // Anotación de Spring para indicar la columna a la que hace referencia (FK)
    @JoinColumn(name = "id_pedido")
    private Pedido pedido;

    // Anotación de Spring para indicar la relación del detalle con los productos
    @ManyToOne

    // Anotación de Spring para indicar la columna a la que hace referencia (FK)
    @JoinColumn(name = "id_producto")
    private Producto producto;

    // Getters y setters para obtener datos de los detalles
    public void setIdDetalle(int idDetalle) {
        this.idDetalle = idDetalle;
    }
    public int getIdDetalle() {
        return idDetalle;
    }
    public void setPrecio(int precio) {
        this.precio = precio;
    }
    public int getPrecio() {
        return precio;
    }
    public void setUnidades(int unidades) {
        this.unidades = unidades;
    }
    public int getUnidades() {
        return unidades;
    }
    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }
    public Pedido getPedido() {
        return pedido;
    }
    public void setProducto(Producto producto) {
        this.producto = producto;
    }
    public Producto getProducto() {
        return producto;
    }
}
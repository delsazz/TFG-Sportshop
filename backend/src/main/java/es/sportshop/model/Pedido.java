package es.sportshop.model;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

// Anotación de Spring para indicar que es una clase de entidad
@Entity

// Anotación de Spring para indicar el nombre de la tabla a la que hace referencia esta clase de entidad
@Table(name = "pedido")
public class Pedido {

    // Anotación de Spring para indicar que es la Primary Key
    @Id

    // Anotación de Spring para que el valor se genere automáicamente
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "id_pedido")
    private int idPedido;

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "fecha_pedido")
    private LocalDate fechaPedido;

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "fecha_entrega")
    private LocalDate fechaEntrega;

    // Anotación de Spring para indicar la relación de los pedidos con el usuario
    @ManyToOne

    // Anotación de Spring para indicar la columna a la que hace referencia (FK)
    @JoinColumn(name = "correo_electronico")
    private Usuario usuario;

    // Anotación de Spring para indicar la relación de los pedidos con el detalle
    @OneToMany(mappedBy = "pedido")
    private List<Detalle> detalles;

    // Getters y setters para obtener datos de los pedidos
    public void setIdPedido(int idPedido) {
        this.idPedido = idPedido;
    }
    public int getIdPedido() {
        return idPedido;
    }
    public void setFechaPedido(LocalDate fechaPedido) {
        this.fechaPedido = fechaPedido;
    }
    public LocalDate getFechaPedido() {
        return fechaPedido;
    }
    public void setFechaEntrega(LocalDate fechaEntrega) {
        this.fechaEntrega = fechaEntrega;
    }
    public LocalDate getFechaEntrega() {
        return fechaEntrega;
    }
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    public Usuario getUsuario() {
        return usuario;
    }
    public void setDetalles(List<Detalle> detalles) {
        this.detalles = detalles;
    }
    public List<Detalle> getDetalles() {
        return detalles;
    }
}
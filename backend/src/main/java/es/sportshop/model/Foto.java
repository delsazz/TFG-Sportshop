package es.sportshop.model;
import jakarta.persistence.*;

// Anotación de Spring para indicar que es una clase de entidad
@Entity

// Anotación de Spring para indicar el nombre de la tabla a la que hace referencia esta clase de entidad
@Table(name = "foto")
public class Foto {

    // Anotación de Spring para indicar que es la Primary Key
    @Id
    // Anotación de Spring para que el valor se genere automáicamente
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "id_foto")
    private int idFoto;

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "nombre_foto")
    private String nombreFoto;

    // Anotación para indicar la relación de las fotos con los productos
    @OneToOne(mappedBy = "foto")
    private Producto producto;

    // Usar getters y setters para obtener datos de las fotos
    public void setIdFoto(int idFoto) {
        this.idFoto = idFoto;
    }
    public int getIdFoto() {
        return idFoto;
    }
    public void setNombreFoto(String nombreFoto) {
        this.nombreFoto = nombreFoto;
    }
    public String getNombreFoto() {
        return nombreFoto;
    }
    public void setProducto(Producto producto) {
        this.producto = producto;
    }
    public Producto getProducto() {
        return producto;
    }
}
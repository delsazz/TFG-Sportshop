package es.sportshop.model;
import jakarta.persistence.*;
import java.util.List;

// Anotación de Spring para indicar que es una clase de entidad
@Entity

// Anotación de Spring para indicar el nombre de la tabla a la que hace referencia esta clase de entidad
@Table(name = "usuario")
public class Usuario {

    // Anotación de Spring para indicar que es la Primary Key
    @Id

    // Anotación de Spring para indicar el nombre de la columna
    @Column(name = "correo_electronico")

    // Atributos para la clase Usario
    private String correoElectronico;
    private String nombre;
    private String apellidos;
    private String telefono;
    private String pw;
    private String rol;
    private String nif;
    private String ciudad;
    private String pais;

    // Anptación de Spring para indicar el nombre de la columna
    @Column(name = "codigo_postal")
    private String codigoPostal;
    private String direccion;

    // Anotación de Spring para indicar la relación de los pedidos con el usuario
    @OneToMany(mappedBy = "usuario")
    private List<Pedido> pedidos;

    // Getters y setters para obtener datos de los usuarios
    public void setCorreoElectronico(String correoElectronico) {
        this.correoElectronico = correoElectronico;
    }
    public String getCorreoElectronico() {
        return correoElectronico;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    public String getNombre() {
        return nombre;
    }
    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }
    public String getApellidos() {
        return apellidos;
    }
    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
    public String getTelefono() {
        return telefono;
    }
    public void setPw(String pw) {
        this.pw = pw;
    }
    public String getPw() {
        return pw;
    }
    public void setRol(String rol) {
        this.rol = rol;
    }
    public String getRol() {
        return rol;
    }
    public void setNif(String nif) {
        this.nif = nif;
    }
    public String getNif() {
        return nif;
    }
    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }
    public String getCiudad() {
        return ciudad;
    }
    public void setPais(String pais) {
        this.pais = pais;
    }
    public String getPais() {
        return pais;
    }
    public void setCodigoPostal(String codigoPostal) {
        this.codigoPostal = codigoPostal;
    }
    public String getCodigoPostal() {
        return codigoPostal;
    }
    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
    public String getDireccion() {
        return direccion;
    }
    public void setPedidos(List<Pedido> pedidos) {
        this.pedidos = pedidos;
    }
    public List<Pedido> getPedidos() {
        return pedidos;
    }
}
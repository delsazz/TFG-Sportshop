package com.tfg.sportshop.model;
import lombok.*;
import java.util.Set;
import java.util.List;
import java.util.HashSet;
import jakarta.persistence.*;
import com.tfg.sportshop.model.Pedido;
@Entity
@Table(name = "usuario")
@Data
@ToString(exclude = {"password", "roles", "pedidos"})
@EqualsAndHashCode(exclude = {"password", "roles", "pedidos"})
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;
    @Column(nullable = false, length = 100)
    private String nombre;
    @Column(nullable = false, length = 100)
    private String apellidos;
    @Column(nullable = false, unique = true, length = 150)
    private String email;
    @Column(nullable = false, length = 255)
    private String password;
    @Column(length = 20)
    private String telefono;
    @Column(length = 20)
    private String nif;
    @Column(length = 100)
    private String ciudad;
    @Column(length = 100)
    private String pais;
    @Column(length = 255)
    private String direccion;
    @Column(name = "direccion_calle", length = 150)
    private String direccionCalle;
    @Column(name = "direccion_numero", length = 30)
    private String direccionNumero;
    @Column(name = "direccion_piso", length = 50)
    private String direccionPiso;
    @Column(name = "direccion_ciudad", length = 100)
    private String direccionCiudad;
    @Column(name = "direccion_provincia", length = 100)
    private String direccionProvincia;
    @Column(name = "codigo_postal", length = 10)
    private String codigoPostal;
    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;
    @Column(length = 50)
    private String rol;
    @Transient
    private Boolean captchaVerified;
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "roles_usuario",
            joinColumns = @JoinColumn(name = "id_usuario"),
            inverseJoinColumns = @JoinColumn(name = "id_rol")
    )
    private List<Roles> roles;
    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    private List<Pedido> pedidos;
}

    // Explicit getters and setters
    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getNif() { return nif; }
    public void setNif(String nif) { this.nif = nif; }
    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    public String getPais() { return pais; }
    public void setPais(String pais) { this.pais = pais; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public String getDireccionCalle() { return direccionCalle; }
    public void setDireccionCalle(String direccionCalle) { this.direccionCalle = direccionCalle; }
    public String getDireccionNumero() { return direccionNumero; }
    public void setDireccionNumero(String direccionNumero) { this.direccionNumero = direccionNumero; }
    public String getDireccionPiso() { return direccionPiso; }
    public void setDireccionPiso(String direccionPiso) { this.direccionPiso = direccionPiso; }
    public String getDireccionCiudad() { return direccionCiudad; }
    public void setDireccionCiudad(String direccionCiudad) { this.direccionCiudad = direccionCiudad; }
    public String getDireccionProvincia() { return direccionProvincia; }
    public void setDireccionProvincia(String direccionProvincia) { this.direccionProvincia = direccionProvincia; }
    public String getCodigoPostal() { return codigoPostal; }
    public void setCodigoPostal(String codigoPostal) { this.codigoPostal = codigoPostal; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public Boolean getCaptchaVerified() { return captchaVerified; }
    public void setCaptchaVerified(Boolean captchaVerified) { this.captchaVerified = captchaVerified; }
    public List<Roles> getRoles() { return roles; }
    public void setRoles(List<Roles> roles) { this.roles = roles; }
    public List<Pedido> getPedidos() { return pedidos; }
    public void setPedidos(List<Pedido> pedidos) { this.pedidos = pedidos; }

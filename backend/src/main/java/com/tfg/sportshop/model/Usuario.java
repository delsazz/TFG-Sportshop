package com.tfg.sportshop.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "usuario")
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

    @Column(name = "comunidad_autonoma", length = 100)
    private String comunidadAutonoma;

    @Column(name = "provincia", length = 100)
    private String provincia;

    @Column(length = 100)
    private String ciudad;

    @Column(name = "codigo_postal", length = 10)
    private String codigoPostal;

    @Column(name = "direccion_calle", length = 150)
    private String direccionCalle;

    @Column(name = "direccion_numero", length = 30)
    private String direccionNumero;

    @Column(name = "direccion_piso", length = 50)
    private String direccionPiso;

    @Column(name = "direccion_ciudad", length = 100)
    private String direccionCiudad;

    @Column(length = 50)
    private String rol;

    @Transient
    private Boolean captchaVerified;

    @Transient
    private String direccionComunidad;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "roles_usuario",
        joinColumns = @JoinColumn(name = "id_usuario"),
        inverseJoinColumns = @JoinColumn(name = "id_rol")
    )
    private List<Roles> roles;

    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    private List<Pedido> pedidos;

    // Getters and Setters
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
    public String getComunidadAutonoma() { return comunidadAutonoma; }
    public void setComunidadAutonoma(String comunidadAutonoma) { this.comunidadAutonoma = comunidadAutonoma; }
    public String getDireccionProvincia() { return provincia; }
    public void setDireccionProvincia(String direccionProvincia) { this.provincia = direccionProvincia; }
    public String getProvincia() { return provincia; }
    public void setProvincia(String provincia) { this.provincia = provincia; }
    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    public String getCodigoPostal() { return codigoPostal; }
    public void setCodigoPostal(String codigoPostal) { this.codigoPostal = codigoPostal; }
    public String getDireccionCalle() { return direccionCalle; }
    public void setDireccionCalle(String direccionCalle) { this.direccionCalle = direccionCalle; }
    public String getDireccionNumero() { return direccionNumero; }
    public void setDireccionNumero(String direccionNumero) { this.direccionNumero = direccionNumero; }
    public String getDireccionPiso() { return direccionPiso; }
    public void setDireccionPiso(String direccionPiso) { this.direccionPiso = direccionPiso; }
    public String getDireccionCiudad() { return direccionCiudad; }
    public void setDireccionCiudad(String direccionCiudad) { this.direccionCiudad = direccionCiudad; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public Boolean getCaptchaVerified() { return captchaVerified; }
    public void setCaptchaVerified(Boolean captchaVerified) { this.captchaVerified = captchaVerified; }
    public String getDireccionComunidad() { return direccionComunidad; }
    public void setDireccionComunidad(String direccionComunidad) { this.direccionComunidad = direccionComunidad; }
    public List<Roles> getRoles() { return roles; }
    public void setRoles(List<Roles> roles) { this.roles = roles; }
    public List<Pedido> getPedidos() { return pedidos; }
    public void setPedidos(List<Pedido> pedidos) { this.pedidos = pedidos; }
}

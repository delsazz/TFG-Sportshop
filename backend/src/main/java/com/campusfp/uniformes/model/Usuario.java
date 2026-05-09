package com.campusfp.uniformes.model;

import jakarta.persistence.*;

@Entity
@Table(name = "usuario")
public class Usuario {
    @Id
    @Column(name = "correo_electronico", length = 100)
    private String correoElectronico;

    @Column(name = "nombre", length = 100)
    private String nombre;

    @Column(name = "apellidos", length = 100)
    private String apellidos;

    @Column(name = "telefono", length = 100)
    private String telefono;

    @Column(name = "pw", length = 255)
    private String pw;

    @Column(name = "rol", length = 100)
    private String rol;

    @Column(name = "nif", length = 20)
    private String nif;

    @Column(name = "ciudad", length = 100)
    private String ciudad;

    @Column(name = "pais", length = 100)
    private String pais;

    @Column(name = "codigo_postal", length = 100)
    private String codigoPostal;

    @Column(name = "direccion", length = 100)
    private String direccion;

    // Getters and Setters
    public String getCorreoElectronico() {
        return correoElectronico;
    }
    public void setCorreoElectronico(String correoElectronico) {
        this.correoElectronico = correoElectronico;
    }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getPw() { return pw; }
    public void setPw(String pw) { this.pw = pw; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }


    public String getNif() { return nif; }
    public void setNif(String nif) { this.nif = nif; }
    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    public String getPais() { return pais; }
    public void setPais(String pais) { this.pais = pais; }
    public String getCodigoPostal() { return codigoPostal; }
    public void setCodigoPostal(String codigoPostal) { this.codigoPostal = codigoPostal; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
}

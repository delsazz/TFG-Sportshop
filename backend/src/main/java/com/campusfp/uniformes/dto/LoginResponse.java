package com.campusfp.uniformes.dto;

public class LoginResponse {
    private String token;
    private String email;
    private String rol;
    private String nombre;
    private String apellidos;

    public LoginResponse(String token, String email, String rol, String nombre, String apellidos) {
        this.token = token;
        this.email = email;
        this.rol = rol;
        this.nombre = nombre;
        this.apellidos = apellidos;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
}

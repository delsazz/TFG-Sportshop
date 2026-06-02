package com.tfg.sportshop.dto;

import java.util.List;
public class LoginResponse {
    private String token;
    private String nombre;
    private Integer idUsuario;
    private String email;
    private List<String> roles;

    public LoginResponse(String token, String nombre, Integer idUsuario, String email, List<String> roles) {
        this.token = token;
        this.nombre = nombre;
        this.idUsuario = idUsuario;
        this.email = email;
        this.roles = roles;
    }

    public String getToken() {
        return token;
    }

    public String getNombre() {
        return nombre;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public String getEmail() {
        return email;
    }

    public List<String> getRoles() {
        return roles;
    }
}

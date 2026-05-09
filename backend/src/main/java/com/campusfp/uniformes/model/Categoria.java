package com.campusfp.uniformes.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categoria")
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    private Integer idCategoria;

    @Column(name = "categoria", nullable = false, length = 100)
    private String categoria;

    public Categoria() {}

    public Categoria(Integer idCategoria, String categoria) {
        this.idCategoria = idCategoria;
        this.categoria = categoria;
    }

    public Integer getIdCategoria() { return idCategoria; }
    public void setIdCategoria(Integer idCategoria) { this.idCategoria = idCategoria; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
}

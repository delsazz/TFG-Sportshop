package com.campusfp.uniformes.model;

import jakarta.persistence.*;

@Entity
@Table(name = "foto")
public class Foto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_foto")
    private Integer idFoto;

    @Column(name = "nombre_foto", length = 100)
    private String nombreFoto;

    public Foto() {}

    public Foto(Integer idFoto, String nombreFoto) {
        this.idFoto = idFoto;
        this.nombreFoto = nombreFoto;
    }

    public Integer getIdFoto() { return idFoto; }
    public void setIdFoto(Integer idFoto) { this.idFoto = idFoto; }

    public String getNombreFoto() { return nombreFoto; }
    public void setNombreFoto(String nombreFoto) { this.nombreFoto = nombreFoto; }
}

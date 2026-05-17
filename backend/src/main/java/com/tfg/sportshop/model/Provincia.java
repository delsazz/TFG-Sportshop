package com.tfg.sportshop.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "provincia")
public class Provincia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_provincia")
    private Integer idProvincia;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_comunidad", nullable = false)
    private ComunidadAutonoma comunidad;

    @OneToMany(mappedBy = "provincia", fetch = FetchType.LAZY)
    private List<Ciudad> ciudades;

    public Provincia() {}

    public Integer getIdProvincia() {
        return idProvincia;
    }

    public void setIdProvincia(Integer idProvincia) {
        this.idProvincia = idProvincia;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public ComunidadAutonoma getComunidad() {
        return comunidad;
    }

    public void setComunidad(ComunidadAutonoma comunidad) {
        this.comunidad = comunidad;
    }

    public List<Ciudad> getCiudades() {
        return ciudades;
    }

    public void setCiudades(List<Ciudad> ciudades) {
        this.ciudades = ciudades;
    }
}
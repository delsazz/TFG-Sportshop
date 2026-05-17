package com.tfg.sportshop.dto.lugares;
public class ProvinciaDTO {
    private Integer id;
    private String nombre;
    private Integer comunidadId;
    public ProvinciaDTO() {}
    public ProvinciaDTO(Integer id, String nombre, Integer comunidadId) {
        this.id = id;
        this.nombre = nombre;
        this.comunidadId = comunidadId;
    }
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public Integer getComunidadId() { return comunidadId; }
    public void setComunidadId(Integer comunidadId) { this.comunidadId = comunidadId; }
}
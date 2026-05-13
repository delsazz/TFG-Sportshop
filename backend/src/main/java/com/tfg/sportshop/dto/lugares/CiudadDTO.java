package com.tfg.sportshop.dto.ubicacion;
public class MunicipioDTO {
    private Integer id;
    private String nombre;
    private Integer provinciaId;
    public MunicipioDTO() {}
    public MunicipioDTO(Integer id, String nombre, Integer provinciaId) {
        this.id = id;
        this.nombre = nombre;
        this.provinciaId = provinciaId;
    }
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public Integer getProvinciaId() { return provinciaId; }
    public void setProvinciaId(Integer provinciaId) { this.provinciaId = provinciaId; }
}
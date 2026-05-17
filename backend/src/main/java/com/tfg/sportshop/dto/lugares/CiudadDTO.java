package com.tfg.sportshop.dto.lugares;
public class CiudadDTO {
    private Integer id;
    private String nombre;
    private Integer idProvincia;
    public CiudadDTO() {}
    public CiudadDTO(Integer id, String nombre, Integer idProvincia) {
        this.id = id;
        this.nombre = nombre;
        this.idProvincia = idProvincia;
    }
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public Integer getIdProvincia() { return idProvincia; }
    public void setProvinciaId(Integer idProvincia) { this.idProvincia = idProvincia; }
}
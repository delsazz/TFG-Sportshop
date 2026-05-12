package com.tfg.sportshop.dto;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TallaStockDTO {
    private Integer idTalla;
    private String nombre;
    private Integer stock;
}
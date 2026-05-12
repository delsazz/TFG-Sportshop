package com.tfg.sportshop.model;
import lombok.*;
import jakarta.persistence.*;
@Entity
@Table(name = "talla")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Talla {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idTalla;
    @Column(name = "nombre", nullable = false, length = 20)
    private String nombre;
}
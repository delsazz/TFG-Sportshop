package com.tfg.sportshop.model;
import lombok.*;
import java.util.List;
import jakarta.persistence.*;
@Entity
@Table(name = "roles")
@Data
@ToString(exclude = {"usuarios"})
@EqualsAndHashCode(exclude = {"usuarios"})
@NoArgsConstructor
@AllArgsConstructor
public class Roles {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idRol;
    @Column(nullable = false, unique = true, length = 50)
    private String nombreRol;
    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    private List<Usuario> usuarios;
}

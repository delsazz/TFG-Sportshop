package com.tfg.sportshop.model;
import lombok.*;
import java.util.Set;
import java.util.List;
import java.util.HashSet;
import jakarta.persistence.*;
import com.tfg.sportshop.model.Pedido;
@Entity
@Table(name = "usuario")
@Data
@ToString(exclude = {"password", "roles", "pedidos"})
@EqualsAndHashCode(exclude = {"password", "roles", "pedidos"})
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;
    @Column(nullable = false, length = 100)
    private String nombre;
    @Column(nullable = false, length = 100)
    private String apellidos;
    @Column(nullable = false, unique = true, length = 150)
    private String email;
    @Column(nullable = false, length = 255)
    private String password;
    @Column(length = 20)
    private String telefono;
    @Column(length = 255)
    private String direccion;
    @Column(name = "direccion_calle", length = 150)
    private String direccionCalle;
    @Column(name = "direccion_numero", length = 30)
    private String direccionNumero;
    @Column(name = "direccion_piso", length = 50)
    private String direccionPiso;
    @Column(name = "direccion_ciudad", length = 100)
    private String direccionCiudad;
    @Column(name = "direccion_provincia", length = 100)
    private String direccionProvincia;
    @Column(name = "codigo_postal", length = 10)
    private String codigoPostal;
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "roles_usuario",
            joinColumns = @JoinColumn(name = "id_usuario"),
            inverseJoinColumns = @JoinColumn(name = "id_rol")
    )
    private List<Roles> roles;
    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    private List<Pedido> pedidos;
}

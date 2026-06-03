package com.tfg.sportshop.model;

import lombok.*;
import jakarta.persistence.*;
import java.util.List;

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

    @Column(length = 20)
    private String nif;

    @Column(length = 100)
    private String ciudad;

    @Column(length = 100)
    private String pais;

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

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @Column(length = 50)
    private String rol;

    @Transient
    private Boolean captchaVerified;

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

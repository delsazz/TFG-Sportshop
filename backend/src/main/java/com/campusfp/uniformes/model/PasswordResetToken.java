package com.campusfp.uniformes.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_token")
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "correo_electronico", referencedColumnName = "correo_electronico", nullable = false)
    private Usuario usuario;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    public PasswordResetToken() {}

    public PasswordResetToken(Integer id, String token, Usuario usuario, LocalDateTime expiryDate) {
        this.id = id;
        this.token = token;
        this.usuario = usuario;
        this.expiryDate = expiryDate;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
}

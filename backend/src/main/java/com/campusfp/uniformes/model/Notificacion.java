package com.campusfp.uniformes.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificacion")
public class Notificacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificacion")
    private Integer idNotificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "correo_electronico", referencedColumnName = "correo_electronico", nullable = false)
    private Usuario usuario;

    @Column(name = "tipo", length = 100)
    private String tipo;

    @Column(name = "mensaje", columnDefinition = "TEXT")
    private String mensaje;

    @Column(name = "fecha")
    private LocalDateTime fecha;

    public Notificacion() {}

    public Notificacion(Integer idNotificacion, Usuario usuario, String tipo, String mensaje, LocalDateTime fecha) {
        this.idNotificacion = idNotificacion;
        this.usuario = usuario;
        this.tipo = tipo;
        this.mensaje = mensaje;
        this.fecha = fecha;
    }

    public Integer getIdNotificacion() { return idNotificacion; }
    public void setIdNotificacion(Integer idNotificacion) { this.idNotificacion = idNotificacion; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
}

package com.tfg.sportshop.model;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "configuracion_sitio")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionSitio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_configuracion")
    private Integer idConfiguracion;

    @Column(name = "logo_header_url", nullable = false, length = 500)
    private String logoHeaderUrl;

    @Column(name = "logo_footer_url", nullable = false, length = 500)
    private String logoFooterUrl;

    @Column(name = "logo_login_url", nullable = false, length = 500)
    private String logoLoginUrl;

    @Column(name = "logo_home_url", nullable = false, length = 500)
    private String logoHomeUrl;

    @Column(name = "logo_admin_url", nullable = false, length = 500)
    private String logoAdminUrl;

    @Column(name = "bizum_telefono", nullable = false, length = 50)
    private String bizumTelefono;

    @Column(name = "bizum_banco_url", nullable = false, length = 500)
    private String bizumBancoUrl;

    @Column(name = "transferencia_titular", nullable = false, length = 150)
    private String transferenciaTitular;

    @Column(name = "transferencia_iban", nullable = false, length = 50)
    private String transferenciaIban;

    @Column(name = "transferencia_concepto", nullable = false, length = 255)
    private String transferenciaConcepto;

    @Column(name = "transferencia_notas", nullable = false, length = 500)
    private String transferenciaNotas;

    @Column(name = "tarjeta_habilitada", nullable = false)
    private boolean tarjetaHabilitada;

    @Column(name = "bizum_habilitado", nullable = false)
    private boolean bizumHabilitado;

    @Column(name = "transferencia_habilitada", nullable = false)
    private boolean transferenciaHabilitada;

    @Column(name = "mostrador_habilitado", nullable = false)
    private boolean mostradorHabilitado;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}


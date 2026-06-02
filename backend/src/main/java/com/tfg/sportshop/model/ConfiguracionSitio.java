package com.tfg.sportshop.model;

import lombok.Data;
import jakarta.persistence.Id;
import java.time.LocalDateTime;
import lombok.NoArgsConstructor;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

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

    @Column(name = "tarjeta_habilitada", nullable = false)
    private boolean tarjetaHabilitada;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
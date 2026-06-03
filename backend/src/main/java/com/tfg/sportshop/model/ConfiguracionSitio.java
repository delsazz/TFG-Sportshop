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
    // Getters and Setters
    public Integer getIdConfiguracion() { return idConfiguracion; }
    public void setIdConfiguracion(Integer idConfiguracion) { this.idConfiguracion = idConfiguracion; }
    public String getLogoHeaderUrl() { return logoHeaderUrl; }
    public void setLogoHeaderUrl(String logoHeaderUrl) { this.logoHeaderUrl = logoHeaderUrl; }
    public String getLogoFooterUrl() { return logoFooterUrl; }
    public void setLogoFooterUrl(String logoFooterUrl) { this.logoFooterUrl = logoFooterUrl; }
    public String getLogoLoginUrl() { return logoLoginUrl; }
    public void setLogoLoginUrl(String logoLoginUrl) { this.logoLoginUrl = logoLoginUrl; }
    public String getLogoHomeUrl() { return logoHomeUrl; }
    public void setLogoHomeUrl(String logoHomeUrl) { this.logoHomeUrl = logoHomeUrl; }
    public String getLogoAdminUrl() { return logoAdminUrl; }
    public void setLogoAdminUrl(String logoAdminUrl) { this.logoAdminUrl = logoAdminUrl; }
    public boolean isTarjetaHabilitada() { return tarjetaHabilitada; }
    public void setTarjetaHabilitada(boolean tarjetaHabilitada) { this.tarjetaHabilitada = tarjetaHabilitada; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
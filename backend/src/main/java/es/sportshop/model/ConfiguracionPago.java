package es.sportshop.model;
import jakarta.persistence.*;

// Anotación de Spring para indicar que es una clase de entidad
@Entity

// Anotación de Spring para indicar el nombre de la tabla
@Table(name = "configuracion_pago")
public class ConfiguracionPago {

    // Anotación de Spring para indicar que es la Primary Key
    @Id
    private int id;

    @Column(name = "telefono_bizum")
    private String telefonoBizum;

    @Column(name = "url_banco_bizum")
    private String urlBancoBizum;

    @Column(name = "titular_transferencia")
    private String titularTransferencia;

    @Column(name = "iban_transferencia")
    private String ibanTransferencia;

    @Column(name = "concepto_transferencia")
    private String conceptoTransferencia;

    @Column(name = "stripe_public_key")
    private String stripePublicKey;

    @Column(name = "stripe_secret_key")
    private String stripeSecretKey;

    public void setId(int id) {
        this.id = id;
    }
    public int getId() {
        return id;
    }
    public void setTelefonoBizum(String telefonoBizum) {
        this.telefonoBizum = telefonoBizum;
    }
    public String getTelefonoBizum() {
        return telefonoBizum;
    }
    public void setUrlBancoBizum(String urlBancoBizum) {
        this.urlBancoBizum = urlBancoBizum;
    }
    public String getUrlBancoBizum() {
        return urlBancoBizum;
    }
    public void setTitularTransferencia(String titularTransferencia) {
        this.titularTransferencia = titularTransferencia;
    }
    public String getTitularTransferencia() {
        return titularTransferencia;
    }
    public void setIbanTransferencia(String ibanTransferencia) {
        this.ibanTransferencia = ibanTransferencia;
    }
    public String getIbanTransferencia() {
        return ibanTransferencia;
    }
    public void setConceptoTransferencia(String conceptoTransferencia) {
        this.conceptoTransferencia = conceptoTransferencia;
    }
    public String getConceptoTransferencia() {
        return conceptoTransferencia;
    }
    public void setStripePublicKey(String stripePublicKey) {
        this.stripePublicKey = stripePublicKey;
    }
    public String getStripePublicKey() {
        return stripePublicKey;
    }
    public void setStripeSecretKey(String stripeSecretKey) {
        this.stripeSecretKey = stripeSecretKey;
    }
    public String getStripeSecretKey() {
        return stripeSecretKey;
    }
}

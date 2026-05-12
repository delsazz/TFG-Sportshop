package com.tfg.sportshop.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;
import com.tfg.sportshop.dto.configuracion.ActualizarConfiguracionSitioRequest;
import com.tfg.sportshop.dto.configuracion.ConfiguracionSitioResponse;
import com.tfg.sportshop.model.ConfiguracionSitio;
import com.tfg.sportshop.repository.ConfiguracionSitioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ConfiguracionSitioService {
    private final ConfiguracionSitioRepository configuracionSitioRepository;

    @Value("${app.upload.config-dir:uploads/configuracion}")
    private String uploadDir;

    @Value("${app.branding.logo.header:/img/campusfp.png}")
    private String defaultLogoHeader;

    @Value("${app.branding.logo.footer:/img/campusfp.png}")
    private String defaultLogoFooter;

    @Value("${app.branding.logo.login:/img/campusfp.png}")
    private String defaultLogoLogin;

    @Value("${app.branding.logo.home:/img/campusfp.png}")
    private String defaultLogoHome;

    @Value("${app.branding.logo.admin:/img/campusfp.png}")
    private String defaultLogoAdmin;

    @Value("${app.upload.max-size:5242880}")
    private long maxFileSize;

    @Value("${app.payments.bizum.phone:+34 600 000 000}")
    private String defaultBizumTelefono;

    @Value("${app.payments.bizum.bank-url:https://www.bizum.es/bancos-bizum/}")
    private String defaultBizumBancoUrl;

    @Value("${app.payments.transfer.account-holder:Campus FP Uniformes}")
    private String defaultTransferenciaTitular;

    @Value("${app.payments.transfer.iban:ES00 0000 0000 0000 0000 0000}")
    private String defaultTransferenciaIban;

    @Value("${app.payments.transfer.concept:Pedido {pedidoId} - Campus FP Uniformes}")
    private String defaultTransferenciaConcepto;

    @Value("${app.payments.transfer.notes:Envia el justificante desde la pantalla de confirmacion del pedido.}")
    private String defaultTransferenciaNotas;

    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;

    public ConfiguracionSitioService(ConfiguracionSitioRepository configuracionSitioRepository) {
        this.configuracionSitioRepository = configuracionSitioRepository;
    }

    @Transactional
    public ConfiguracionSitioResponse obtenerConfiguracion() {
        return toResponse(obtenerOCrearConfiguracion());
    }

    @Transactional
    public ConfiguracionSitioResponse actualizarConfiguracion(
        ActualizarConfiguracionSitioRequest request,
        MultipartFile logoHeader,
        MultipartFile logoFooter,
        MultipartFile logoLogin,
        MultipartFile logoHome,
        MultipartFile logoAdmin
    ) {
        ConfiguracionSitio configuracion = obtenerOCrearConfiguracion();

        actualizarTexto(request.bizumTelefono(), configuracion::setBizumTelefono, configuracion.getBizumTelefono(), defaultBizumTelefono);
        actualizarTexto(request.bizumBancoUrl(), configuracion::setBizumBancoUrl, configuracion.getBizumBancoUrl(), defaultBizumBancoUrl);
        actualizarTexto(request.transferenciaTitular(), configuracion::setTransferenciaTitular, configuracion.getTransferenciaTitular(), defaultTransferenciaTitular);
        actualizarTexto(request.transferenciaIban(), configuracion::setTransferenciaIban, configuracion.getTransferenciaIban(), defaultTransferenciaIban);
        actualizarTexto(request.transferenciaConcepto(), configuracion::setTransferenciaConcepto, configuracion.getTransferenciaConcepto(), defaultTransferenciaConcepto);
        actualizarTexto(request.transferenciaNotas(), configuracion::setTransferenciaNotas, configuracion.getTransferenciaNotas(), defaultTransferenciaNotas);

        configuracion.setTarjetaHabilitada(request.tarjetaHabilitada() != null ? request.tarjetaHabilitada() : configuracion.isTarjetaHabilitada());
        configuracion.setBizumHabilitado(request.bizumHabilitado() != null ? request.bizumHabilitado() : configuracion.isBizumHabilitado());
        configuracion.setTransferenciaHabilitada(request.transferenciaHabilitada() != null ? request.transferenciaHabilitada() : configuracion.isTransferenciaHabilitada());
        configuracion.setMostradorHabilitado(request.mostradorHabilitado() != null ? request.mostradorHabilitado() : configuracion.isMostradorHabilitado());

        configuracion.setLogoHeaderUrl(guardarLogoSiCorresponde(logoHeader, configuracion.getLogoHeaderUrl(), "header"));
        configuracion.setLogoFooterUrl(guardarLogoSiCorresponde(logoFooter, configuracion.getLogoFooterUrl(), "footer"));
        configuracion.setLogoLoginUrl(guardarLogoSiCorresponde(logoLogin, configuracion.getLogoLoginUrl(), "login"));
        configuracion.setLogoHomeUrl(guardarLogoSiCorresponde(logoHome, configuracion.getLogoHomeUrl(), "home"));
        configuracion.setLogoAdminUrl(guardarLogoSiCorresponde(logoAdmin, configuracion.getLogoAdminUrl(), "admin"));
        configuracion.setUpdatedAt(LocalDateTime.now());

        return toResponse(configuracionSitioRepository.save(configuracion));
    }

    @Transactional
    public boolean metodoPagoHabilitado(String metodoPago) {
        String normalizado = normalizarMetodoPago(metodoPago);
        ConfiguracionSitio configuracion = obtenerOCrearConfiguracion();

        return switch (normalizado) {
            case "tarjeta", "stripe", "credit_card" -> configuracion.isTarjetaHabilitada();
            case "bizum" -> configuracion.isBizumHabilitado();
            case "transferencia", "transferencia bancaria", "bank_transfer" -> configuracion.isTransferenciaHabilitada();
            case "mostrador", "pago en mostrador", "presencial", "cash" -> configuracion.isMostradorHabilitado();
            default -> false;
        };
    }

    @Transactional
    public void validarMetodoPagoHabilitado(String metodoPago) {
        if (!metodoPagoHabilitado(metodoPago)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El metodo de pago seleccionado no esta disponible");
        }
    }

    @Transactional
    public ConfiguracionSitioResponse obtenerConfiguracionPago() {
        ConfiguracionSitioResponse configuracion = obtenerConfiguracion();
        return new ConfiguracionSitioResponse(
            configuracion.idConfiguracion(),
            null,
            null,
            null,
            null,
            null,
            configuracion.bizumTelefono(),
            configuracion.bizumBancoUrl(),
            configuracion.transferenciaTitular(),
            configuracion.transferenciaIban(),
            configuracion.transferenciaConcepto(),
            configuracion.transferenciaNotas(),
            configuracion.tarjetaHabilitada(),
            configuracion.bizumHabilitado(),
            configuracion.transferenciaHabilitada(),
            configuracion.mostradorHabilitado(),
            configuracion.updatedAt()
        );
    }

    private ConfiguracionSitio obtenerOCrearConfiguracion() {
        return configuracionSitioRepository.findFirstByOrderByIdConfiguracionAsc()
            .orElseGet(() -> configuracionSitioRepository.save(crearConfiguracionPorDefecto()));
    }

    private ConfiguracionSitio crearConfiguracionPorDefecto() {
        ConfiguracionSitio configuracion = new ConfiguracionSitio();
        configuracion.setLogoHeaderUrl(defaultLogoHeader);
        configuracion.setLogoFooterUrl(defaultLogoFooter);
        configuracion.setLogoLoginUrl(defaultLogoLogin);
        configuracion.setLogoHomeUrl(defaultLogoHome);
        configuracion.setLogoAdminUrl(defaultLogoAdmin);
        configuracion.setBizumTelefono(defaultBizumTelefono);
        configuracion.setBizumBancoUrl(defaultBizumBancoUrl);
        configuracion.setTransferenciaTitular(defaultTransferenciaTitular);
        configuracion.setTransferenciaIban(defaultTransferenciaIban);
        configuracion.setTransferenciaConcepto(defaultTransferenciaConcepto);
        configuracion.setTransferenciaNotas(defaultTransferenciaNotas);
        configuracion.setTarjetaHabilitada(stripeSecretKey != null && !stripeSecretKey.isBlank());
        configuracion.setBizumHabilitado(true);
        configuracion.setTransferenciaHabilitada(true);
        configuracion.setMostradorHabilitado(true);
        configuracion.setUpdatedAt(LocalDateTime.now());
        return configuracion;
    }

    private void actualizarTexto(String valor, Setter setter, String actual, String fallback) {
        if (valor == null || valor.isBlank()) {
            setter.set(normalizarTexto(actual, fallback));
            return;
        }

        setter.set(valor.trim());
    }

    private String normalizarTexto(String valor, String fallback) {
        return valor == null || valor.isBlank() ? fallback : valor.trim();
    }

    private String guardarLogoSiCorresponde(MultipartFile file, String actual, String prefijo) {
        if (file == null || file.isEmpty()) {
            return normalizarLogo(actual, defaultLogoHeader);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se permiten imagenes en los logos");
        }

        if (file.getSize() > maxFileSize) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo supera el tamano maximo permitido");
        }

        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String filename = prefijo + "-" + UUID.randomUUID() + extension;
            Files.write(uploadPath.resolve(filename), file.getBytes());
            eliminarLogoAnterior(actual);
            return "/uploads/configuracion/" + filename;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar el logo");
        }
    }

    private void eliminarLogoAnterior(String actual) throws IOException {
        if (actual == null || !actual.startsWith("/uploads/configuracion/")) {
            return;
        }

        String filename = actual.substring(actual.lastIndexOf('/') + 1);
        Path filePath = Paths.get(uploadDir).resolve(filename);
        Files.deleteIfExists(filePath);
    }

    private ConfiguracionSitioResponse toResponse(ConfiguracionSitio configuracion) {
        return new ConfiguracionSitioResponse(
            configuracion.getIdConfiguracion(),
            normalizarLogo(configuracion.getLogoHeaderUrl(), defaultLogoHeader),
            normalizarLogo(configuracion.getLogoFooterUrl(), defaultLogoFooter),
            normalizarLogo(configuracion.getLogoLoginUrl(), defaultLogoLogin),
            normalizarLogo(configuracion.getLogoHomeUrl(), defaultLogoHome),
            normalizarLogo(configuracion.getLogoAdminUrl(), defaultLogoAdmin),
            normalizarTexto(configuracion.getBizumTelefono(), defaultBizumTelefono),
            normalizarTexto(configuracion.getBizumBancoUrl(), defaultBizumBancoUrl),
            normalizarTexto(configuracion.getTransferenciaTitular(), defaultTransferenciaTitular),
            normalizarTexto(configuracion.getTransferenciaIban(), defaultTransferenciaIban),
            normalizarTexto(configuracion.getTransferenciaConcepto(), defaultTransferenciaConcepto),
            normalizarTexto(configuracion.getTransferenciaNotas(), defaultTransferenciaNotas),
            configuracion.isTarjetaHabilitada(),
            configuracion.isBizumHabilitado(),
            configuracion.isTransferenciaHabilitada(),
            configuracion.isMostradorHabilitado(),
            configuracion.getUpdatedAt()
        );
    }

    private String normalizarLogo(String valor, String fallback) {
        return normalizarTexto(valor, fallback);
    }

    private String normalizarMetodoPago(String metodoPago) {
        return metodoPago == null ? "" : metodoPago.trim().toLowerCase(Locale.ROOT);
    }

    @FunctionalInterface
    private interface Setter {
        void set(String value);
    }
}


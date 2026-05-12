package com.tfg.sportshop.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pedido_entrega")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoEntrega {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_entrega")
    private Integer idEntrega;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido", nullable = false)
    private Pedido pedido;

    @Column(name = "fecha_entrega", nullable = false)
    private LocalDateTime fechaEntrega;

    @Column(name = "comprobante_entrega_url", columnDefinition = "TEXT")
    private String comprobanteEntregaUrl;

    @Column(name = "comprobante_entrega_nombre_archivo")
    private String comprobanteEntregaNombreArchivo;

    @Column(name = "firma_recepcion", columnDefinition = "TEXT")
    private String firmaRecepcion;

    @Column(name = "nombre_recibe")
    private String nombreRecibe;

    @Column(name = "documento_recibe")
    private String documentoRecibe;

    @Column(name = "observaciones", length = 500)
    private String observaciones;

    @OneToMany(mappedBy = "entrega", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PedidoEntregaLinea> lineas;
}

package com.tfg.sportshop.model;

import lombok.Data;
import java.util.List;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;;

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

    
    // Explicit getters and setters
    public Integer getIdEntrega() { return idEntrega; }
    public void setIdEntrega(Integer idEntrega) { this.idEntrega = idEntrega; }
    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }
    public LocalDateTime getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(LocalDateTime fechaEntrega) { this.fechaEntrega = fechaEntrega; }
    public List<PedidoEntregaLinea> getLineas() { return lineas; }
    public void setLineas(List<PedidoEntregaLinea> lineas) { this.lineas = lineas; }(mappedBy = "entrega", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PedidoEntregaLinea> lineas;
}

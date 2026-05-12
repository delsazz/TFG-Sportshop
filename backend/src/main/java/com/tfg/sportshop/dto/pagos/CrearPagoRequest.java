package com.tfg.sportshop.dto.pagos;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CrearPagoRequest {
    @NotNull(message = "El pedido es requerido")
    private Integer idPedido;
    private String successUrl;
    private String cancelUrl;
}

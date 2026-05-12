package com.tfg.sportshop.model;

public enum EstadoPedido {
    PENDIENTE("PENDIENTE"),
    PAGADO("PAGADO"),
    EN_PREPARACION("EN_PREPARACION"),
    ENVIADO("ENVIADO"),
    ENTREGADO_PARCIAL("ENTREGADO_PARCIAL"),
    ENTREGADO_COMPLETO("ENTREGADO_COMPLETO"),
    CANCELADO("CANCELADO");

    private final String valor;

    EstadoPedido(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }

    public static EstadoPedido fromValor(String valor) {
        if (valor == null) {
            throw new IllegalArgumentException("Estado no valido: null");
        }

        String normalizado = valor.trim();
        for (EstadoPedido estado : EstadoPedido.values()) {
            if (estado.valor.equalsIgnoreCase(normalizado) || estado.name().equalsIgnoreCase(normalizado)) {
                return estado;
            }
        }

        if ("entregado parcial".equalsIgnoreCase(normalizado)) {
            return ENTREGADO_PARCIAL;
        }

        if ("entregado".equalsIgnoreCase(normalizado)
                || "entregado completo".equalsIgnoreCase(normalizado)
                || "completado".equalsIgnoreCase(normalizado)) {
            return ENTREGADO_COMPLETO;
        }

        throw new IllegalArgumentException("Estado no valido: " + valor);
    }
}

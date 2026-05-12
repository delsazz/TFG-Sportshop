package com.tfg.sportshop.model;

public enum EstadoEntregaLinea {
    SIN_ENTREGAR,
    EN_REPARTO,
    ENTREGADA;

    public static EstadoEntregaLinea fromValor(String valor) {
        if (valor == null || valor.isBlank()) {
            return SIN_ENTREGAR;
        }

        return EstadoEntregaLinea.valueOf(valor.trim().toUpperCase());
    }
}

-- ============================================================
-- V30 — Añadir columna estado_entrega a pedido_entrega_linea
-- ============================================================
-- La entidad PedidoEntregaLinea.java declara
-- @Column(name = "estado_entrega", nullable = false). La columna no
-- se creó al introducir la entrega parcial (V21). Sin esto Hibernate
-- aborta el arranque con:
--
--   missing column [estado_entrega] in table [pedido_entrega_linea]
--
-- La tabla está vacía en /dev/ y producción, así que aplicar
-- NOT NULL directamente es seguro. Default 'PENDIENTE' por si en
-- algún entorno hubiera filas previas.

ALTER TABLE pedido_entrega_linea
    ADD COLUMN IF NOT EXISTS estado_entrega VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE';

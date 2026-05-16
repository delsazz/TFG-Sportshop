ALTER TABLE detalle_pedido ADD COLUMN id_talla INT;

ALTER TABLE detalle_pedido
    ADD CONSTRAINT fk_detalle_talla
    FOREIGN KEY (id_talla) REFERENCES talla(id_talla)
    ON DELETE SET NULL;

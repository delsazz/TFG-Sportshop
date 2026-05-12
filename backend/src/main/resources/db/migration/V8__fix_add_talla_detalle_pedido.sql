-- Asegurar que la columna id_talla existe en detalle_pedido
-- (En caso de que V7 no se haya ejecutado correctamente)
ALTER TABLE detalle_pedido ADD COLUMN IF NOT EXISTS id_talla INTEGER;

-- Añadir foreign key si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'detalle_pedido' 
        AND constraint_name = 'fk_detalle_talla'
    ) THEN
        ALTER TABLE detalle_pedido
            ADD CONSTRAINT fk_detalle_talla
            FOREIGN KEY (id_talla) REFERENCES talla(id_talla)
            ON DELETE SET NULL;
    END IF;
END $$;

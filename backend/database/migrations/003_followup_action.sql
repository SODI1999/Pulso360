-- Campo ofrecido por el formulario de seguimiento existente. No altera notas históricas.
ALTER TABLE seguimientos_intervencion ADD COLUMN tipo_accion VARCHAR(100);

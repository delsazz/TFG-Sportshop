-- ============================================================
-- V28 — Renombrar tabla token_cambio_contrasena → password_reset_token
-- ============================================================
-- V16 creó la tabla con el nombre token_cambio_contrasena, pero la
-- entidad PasswordResetToken.java declara @Table(name = "password_reset_token").
-- Hibernate aborta el arranque del backend con:
--
--   Schema-validation: missing table [password_reset_token]
--
-- Aprendizaje: cuando una entidad y una migración se hacen en PRs
-- distintos, es fácil que los nombres no coincidan. Conviene fijar
-- la convención (en este proyecto: nombres en castellano y snake_case)
-- y revisar @Table(name=...) y CREATE TABLE en el mismo PR.

ALTER TABLE IF EXISTS token_cambio_contrasena
    RENAME TO password_reset_token;

ALTER INDEX IF EXISTS idx_token_cambio_contrasena_usuario
    RENAME TO idx_password_reset_token_usuario;

ALTER INDEX IF EXISTS idx_token_cambio_contrasena_expiracion
    RENAME TO idx_password_reset_token_expiracion;

ALTER TABLE IF EXISTS password_reset_token
    RENAME CONSTRAINT fk_token_cambio_contrasena_usuario
    TO fk_password_reset_token_usuario;

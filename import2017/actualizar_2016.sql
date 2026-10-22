-- MIR 2016 (ya en producción): 2016 pasa a ser convocatoria oficial. Idempotente, sin BEGIN/COMMIT. Revierte: revertir_actualizar_2016.sql
-- A) Las 3 anuladas (95, 206, 220): nuevo motivo_anulacion.
UPDATE preguntas SET motivo_anulacion = 'Anulada en la plantilla oficial del Ministerio de Sanidad (sin respuesta correcta).'
WHERE "año" = 2016 AND anulada AND numero IN (95, 206, 220) AND motivo_anulacion IS DISTINCT FROM 'Anulada en la plantilla oficial del Ministerio de Sanidad (sin respuesta correcta).';

-- B) Pregunta 11 (id 1815): la clave ya está confirmada con la plantilla oficial; sigue requiere_revision = true por la explicación.
UPDATE preguntas SET motivo_revision = 'explicacion_con_hallazgos_no_confirmables_en_imagen'
WHERE "año" = 2016 AND numero = 11 AND motivo_revision = 'clave_pendiente_de_contrastar_con_plantilla_oficial';

-- Deshace actualizar_2016.sql con los valores que tenían las filas antes (sin BEGIN/COMMIT).
UPDATE preguntas SET motivo_anulacion = 'Marcada como anulada en la fuente de la transcripción del examen MIR de enero de 2016 (sin respuesta correcta); pendiente de contrastar con la plantilla oficial.'
WHERE "año" = 2016 AND anulada AND numero IN (95, 206, 220);
UPDATE preguntas SET motivo_revision = 'clave_pendiente_de_contrastar_con_plantilla_oficial'
WHERE "año" = 2016 AND numero = 11 AND motivo_revision = 'explicacion_con_hallazgos_no_confirmables_en_imagen';

# Genera importar_2017.sql desde el JSON de preguntas, la clasificación final y las explicaciones. Sin BD.
import json
L=lambda f:json.load(open(f,encoding='utf-8'))
P=L('import2017/mir2017_preguntas.json'); K={c['numero']:c for c in L('import2017/clasificacion_2017_final.json')}
E=L('import2017/explicaciones_2017.json'); M=set(L('import2017/trabajo/manuales_32.json'))
MOT="Anulada en la plantilla oficial del Ministerio de Sanidad (sin respuesta correcta)."
rows=[]
for p in P:
    n=p['numero']; k=K[n]; an=p['anulada']; assert (p['correcta'] is None)==an
    rows.append(dict(numero=n,especialidad=k['especialidad'],tema=k['tema'],pregunta=p['enunciado'],opcion_a=p['opcion_a'],opcion_b=p['opcion_b'],opcion_c=p['opcion_c'],opcion_d=p['opcion_d'],
      correcta='-' if an else p['correcta'],explicacion=None if an else E[str(n)],explicacion_calidad=None if an else ('revisada' if n in M else 'orientativa'),
      imagen_path=f"/imagenes-mir/2016/{p['imagen']}" if p['imagen'] else None,anulada=an,motivo_anulacion=MOT if an else None,requiere_revision=False,motivo_revision=None))
js=json.dumps(rows,ensure_ascii=False); assert '$J$' not in js
open('import2017/importar_2017.sql','w',encoding='utf-8').write(f'''-- MIR 2017: 235 preguntas (231 con respuesta + 4 anuladas). Idempotente: no inserta si ya existe (año=2017, numero).
-- No incluye BEGIN/COMMIT: lo decide quien lo invoca. Las imágenes van aparte en public/imagenes-mir/2016/.
INSERT INTO preguntas ("año",numero,especialidad,tema,pregunta,opcion_a,opcion_b,opcion_c,opcion_d,correcta,explicacion,explicacion_calidad,imagen_path,origen,anulada,motivo_anulacion,requiere_revision,motivo_revision)
SELECT 2017,r.numero,r.especialidad,r.tema,r.pregunta,r.opcion_a,r.opcion_b,r.opcion_c,r.opcion_d,r.correcta,r.explicacion,r.explicacion_calidad,r.imagen_path,'oficial',r.anulada,r.motivo_anulacion,r.requiere_revision,r.motivo_revision
FROM jsonb_to_recordset($J${js}$J$::jsonb) AS r(numero int,especialidad text,tema text,pregunta text,opcion_a text,opcion_b text,opcion_c text,opcion_d text,correcta text,explicacion text,explicacion_calidad text,imagen_path text,anulada boolean,motivo_anulacion text,requiere_revision boolean,motivo_revision text)
WHERE NOT EXISTS (SELECT 1 FROM preguntas p WHERE p."año"=2017 AND p.numero=r.numero);
''')
print(len(rows),sum(r['anulada'] for r in rows),sum(r['requiere_revision'] for r in rows),sorted({r['motivo_anulacion'] for r in rows if r['motivo_anulacion']}))

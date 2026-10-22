# Une entrada, veredictos y alternativos de la Fase 4 de vídeos de 2017: videos_2017.json, tablas del informe y exclusiones propuestas. Sin BD.
import json,random,datetime
T='import2017/trabajo/'; L=lambda f:json.load(open(f,encoding='utf-8'))
e=L(T+'entrada_videos.json'); v=L(T+'veredictos_videos.json'); a=L(T+'alternativos_videos.json'); bib={}
for b in L(T+'biblioteca.json'): bib.setdefault(b['vid'],b)
HOY=datetime.date(2026,10,22); LIM=(HOY.replace(year=HOY.year-5)).isoformat()   # más de 5 años
def edad(f): d=datetime.date.fromisoformat(f); return round((HOY-d).days/365.25,1)
def resumen(s,n=120): s=' '.join(s.split()); return s if len(s)<=n else s[:n-1]+'…'
QUITAR={56,141,177}  # decisión de José 22-10 (4c): mantienen su vídeo
ANADIR=[10,11,13,23,66,81,131,133,149,151,153,154,156,158,161,162,175,180,214,232]  # 4c: quitar vídeo, sin alternativo (veredicto de la repetición 4b)
SIN_ALT={73}  # decisión de José (22-10): el alternativo de valvulopatías no trata la hipertensión pulmonar -> quitar vídeo sin alternativo
vb=L(T+'veredictos_videos_b.json'); vc=L(T+'veredictos_videos_c.json'); ab=L(T+'alternativos_videos_b.json')
out=[]
for q in e:
    k=str(q['numero']); r=v[k]; al=a.get(k) or {}; alt=None if q['numero'] in SIN_ALT else al.get('alternativo')
    antiguo=q['fecha']<LIM; sens=r['sensible_a_guias']
    excluir = r['veredicto']=='no encaja' or (r['veredicto']=='en parte' and antiguo and sens)
    if q['numero'] in QUITAR: excluir=False
    if q['numero'] in ANADIR: excluir=True; alt=None
    motivo_excl = ('no encaja' if r['veredicto']=='no encaja' else 'en parte, antiguo y sensible a guías o tratamiento') if excluir else None
    out.append(dict(numero=q['numero'],id_bd=q['id'],especialidad=q['especialidad'],tema=q['tema'],enunciado=resumen(q['pregunta'],200),
      correcta=q['correcta'],video=dict(vid=q['vid'],youtube_id=q['youtube_id'],titulo=q['titulo'],canal=q['canal'],fecha=q['fecha'],edad_anios=edad(q['fecha']),mas_de_5_anios=antiguo),
      veredicto=r['veredicto'],motivo=r['motivo'].rstrip('.'),sensible_a_guias=sens,
      veredicto_4b=(vb.get(k) or {}).get('veredicto'),motivo_4b=(vb.get(k) or {}).get('motivo'),alternativo_4b=(ab.get(k) or {}).get('alternativo'),veredicto_comprobacion_88=(vc.get(k) or {}).get('veredicto'),
      accion=('excluir_con_alternativo' if excluir and alt else 'excluir_sin_alternativo') if excluir else 'mantener',motivo_exclusion=('no encaja (repetición con título primero)' if q['numero'] in ANADIR else motivo_excl),
      alternativo=(dict(vid=alt,titulo=bib[alt]['titulo'],fecha=bib[alt]['fecha'],edad_anios=edad(bib[alt]['fecha']),motivo=al.get('motivo')) if alt else None)))
json.dump(out,open('import2017/videos_2017.json','w'),ensure_ascii=False,indent=1)
ex=[dict(id=x['id_bd'],num=x['numero'],excl=x['video']['vid'],alt=(x['alternativo'] or {}).get('vid'),
         motivo=((x['motivo_4b'] or '').rstrip('.') if x['numero'] in ANADIR else x['motivo'] if x['veredicto']=='no encaja' else f"Encaja en parte ({x['motivo']}) y es de {x['video']['fecha'][:4]}, antiguo para una pregunta sensible a guías o tratamiento"))
    for x in out if x['accion']!='mantener']
json.dump(ex,open(T+'exclusiones_propuestas_2017.json','w'),ensure_ascii=False,indent=1)
import collections
print('veredictos:',dict(collections.Counter(x['veredicto'] for x in out)))
g1=[x for x in out if x['veredicto']=='no encaja']; g2=[x for x in out if x['veredicto']=='en parte']
g2x=[x for x in g2 if x['accion']!='mantener']; g2k=[x for x in g2 if x['accion']=='mantener']
enc=[x for x in out if x['veredicto']=='encaja']
print('no encaja',len(g1),'(con alternativo',sum(1 for x in g1 if x['alternativo']),') | en parte',len(g2),'-> se excluirían',len(g2x),', se mantienen',len(g2k),'| encaja',len(enc),'(antiguo+sensible:',sum(1 for x in enc if x['video']['mas_de_5_anios'] and x['sensible_a_guias']),')')
print('exclusiones propuestas:',len(ex),'con alt',sum(1 for x in ex if x['alt']),'sin vídeo',sum(1 for x in ex if not x['alt']))
def fila(x,extra=''):
    al=x['alternativo']; prop='Mantener' if x['accion']=='mantener' else (f"Alternativo #{al['vid']} «{al['titulo']}» ({al['fecha'][:4]})" if al else 'Quitar vídeo (sin alternativo)')
    return f"| {x['numero']} | {x['especialidad']} / {(x['tema'] or '').split(' — ')[0]} | {resumen(x['enunciado'],120).replace('|','/')} | {x['video']['titulo'].replace('|','/')} | {x['video']['canal']} | {x['video']['fecha'][:4]} ({x['video']['edad_anios']:.0f} a) | {x['motivo'].replace('|','/')} | {prop} |"
H='| Nº | Especialidad / tema | Enunciado | Vídeo | Canal | Año | Motivo | Propuesta |\n|--:|---|---|---|---|---|---|---|'
open(T+'tablas_videos.md','w',encoding='utf-8').write('### NO ENCAJA ('+str(len(g1))+')\n'+H+'\n'+'\n'.join(fila(x) for x in g1)+'\n\n### EN PARTE que se excluirían, antiguos (>5 años) y sensibles a guías ('+str(len(g2x))+')\n'+H+'\n'+'\n'.join(fila(x) for x in g2x)+'\n\n### EN PARTE que se mantienen ('+str(len(g2k))+')\n'+H+'\n'+'\n'.join(fila(x) for x in g2k)+'\n\n### ENCAJA, muestra de 10 al azar (semilla 2017) de '+str(len(enc))+'\n'+H+'\n'+'\n'.join(fila(x) for x in sorted(random.Random(2017).sample(enc,10),key=lambda x:x['numero']))+'\n')

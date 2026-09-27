-- Corrección de palabras partidas (espacio insertado a mitad de palabra)
-- 125 casos: 95 ya conocidos del audit 2026-09-26 + 29 nuevos hallados en el
-- reescaneo de hoy sobre las 1058 preguntas actuales + id 543 de la auditoria
-- de los 5 años. Log completo: /root/log_palabras_partidas_20260927.csv
-- Cada UPDATE lleva su propia guarda de fila (debe afectar EXACTAMENTE 1 fila).
BEGIN;

DO $$
DECLARE n int;
BEGIN
  UPDATE preguntas SET pregunta = replace(pregunta, 'infiltr ante', 'infiltrante') WHERE id = 395;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 395 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'hipoacusi a', 'hipoacusia') WHERE id = 397;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 397 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'g astrostomía', 'gastrostomía') WHERE id = 399;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 399 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'estertor es', 'estertores') WHERE id = 401;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 401 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'co morbilidad', 'comorbilidad') WHERE id = 404;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 404 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'mielofi brosis', 'mielofibrosis') WHERE id = 405;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 405 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'an gioTC', 'angioTC') WHERE id = 406;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 406 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'a rtroplastia', 'artroplastia') WHERE id = 411;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 411 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'notad o', 'notado') WHERE id = 413;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 413 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'rea liza', 'realiza') WHERE id = 413;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 413 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'esofa gitis', 'esofagitis') WHERE id = 430;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 430 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'eo sinofílica', 'eosinofílica') WHERE id = 430;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 430 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'esta do', 'estado') WHERE id = 442;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 442 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'his teroscopia', 'histeroscopia') WHERE id = 452;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 452 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'primi gesta', 'primigesta') WHERE id = 454;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 454 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'end ometrio', 'endometrio') WHERE id = 455;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 455 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'f ibrinógeno', 'fibrinógeno') WHERE id = 462;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 462 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'tr ansaminasas', 'transaminasas') WHERE id = 462;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 462 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'an ticolinérgico', 'anticolinérgico') WHERE id = 474;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 474 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'o rigen', 'origen') WHERE id = 477;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 477 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'antiepiléptic o', 'antiepiléptico') WHERE id = 479;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 479 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'me ticilin', 'meticilin') WHERE id = 485;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 485 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'rota dor', 'rotador') WHERE id = 492;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 492 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'ce ntrotorácico', 'centrotorácico') WHERE id = 499;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 499 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'an teroseptal', 'anteroseptal') WHERE id = 499;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 499 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'tr anstorácico', 'transtorácico') WHERE id = 502;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 502 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'es teatosis', 'esteatosis') WHERE id = 517;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 517 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'he patocarcinoma', 'hepatocarcinoma') WHERE id = 517;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 517 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'aden ocarcinoma', 'adenocarcinoma') WHERE id = 522;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 522 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'po lipectomía', 'polipectomía') WHERE id = 525;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 525 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'c olectomía', 'colectomía') WHERE id = 525;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 525 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'omepra zol', 'omeprazol') WHERE id = 530;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 530 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'pr oteinuria', 'proteinuria') WHERE id = 530;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 530 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'An gioTC', 'AngioTC') WHERE id = 531;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 531 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'creati nina', 'creatinina') WHERE id = 531;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 531 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'tra nsaminasas', 'transaminasas') WHERE id = 531;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 531 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'pare ja', 'pareja') WHERE id = 534;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 534 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'm icrocítico', 'microcítico') WHERE id = 537;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 537 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'mi eloide', 'mieloide') WHERE id = 542;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 542 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'h ematopoyético', 'hematopoyético') WHERE id = 542;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 542 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'don ante', 'donante') WHERE id = 542;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 542 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'gonalgi a', 'gonalgia') WHERE id = 560;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 560 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'di agnosticándose', 'diagnosticándose') WHERE id = 563;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 563 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'acen ocumarol', 'acenocumarol') WHERE id = 564;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 564 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'ami odarona', 'amiodarona') WHERE id = 564;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 564 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'Seña le', 'Señale') WHERE id = 564;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 564 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'va sculitis', 'vasculitis') WHERE id = 565;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 565 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'adenoc arcinoma', 'adenocarcinoma') WHERE id = 569;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 569 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'foc alidad', 'focalidad') WHERE id = 579;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 579 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'li nfoblástica', 'linfoblástica') WHERE id = 582;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 582 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'hipoc alcemia', 'hipocalcemia') WHERE id = 582;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 582 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_a = replace(opcion_a, 'secunda ria', 'secundaria') WHERE id = 399;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 399 campo opcion_a: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_d = replace(opcion_d, 'modera da', 'moderada') WHERE id = 402;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 402 campo opcion_d: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_a = replace(opcion_a, 'co lecistectomía', 'colecistectomía') WHERE id = 404;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 404 campo opcion_a: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_d = replace(opcion_d, 'colecis tectomía', 'colecistectomía') WHERE id = 404;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 404 campo opcion_d: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_c = replace(opcion_c, 'e nalapril', 'enalapril') WHERE id = 406;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 406 campo opcion_c: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_a = replace(opcion_a, 'i noculación', 'inoculación') WHERE id = 424;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 424 campo opcion_a: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_d = replace(opcion_d, 'ci totóxicos', 'citotóxicos') WHERE id = 425;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 425 campo opcion_d: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_b = replace(opcion_b, 'ele vado', 'elevado') WHERE id = 426;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 426 campo opcion_b: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_c = replace(opcion_c, 'inmuniz ación', 'inmunización') WHERE id = 426;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 426 campo opcion_c: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_d = replace(opcion_d, 'G oodpasture', 'Goodpasture') WHERE id = 427;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 427 campo opcion_d: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_a = replace(opcion_a, 'an terolateral', 'anterolateral') WHERE id = 445;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 445 campo opcion_a: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_a = replace(opcion_a, 'fasciocu táneo', 'fasciocutáneo') WHERE id = 445;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 445 campo opcion_a: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_d = replace(opcion_d, 'eco gráficos', 'ecográficos') WHERE id = 455;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 455 campo opcion_d: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_c = replace(opcion_c, 'normoinse rta', 'normoinserta') WHERE id = 459;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 459 campo opcion_c: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_d = replace(opcion_d, 'antipsic ótico', 'antipsicótico') WHERE id = 470;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 470 campo opcion_d: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_d = replace(opcion_d, 'tiene n', 'tienen') WHERE id = 471;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 471 campo opcion_d: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_a = replace(opcion_a, 'sien do', 'siendo') WHERE id = 478;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 478 campo opcion_a: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_c = replace(opcion_c, 'qu imioprofilaxis', 'quimioprofilaxis') WHERE id = 481;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 481 campo opcion_c: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_c = replace(opcion_c, 'rad iocirugía', 'radiocirugía') WHERE id = 483;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 483 campo opcion_c: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_c = replace(opcion_c, 'bet abloqueantes', 'betabloqueantes') WHERE id = 501;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 501 campo opcion_c: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_d = replace(opcion_d, 'muscula res', 'musculares') WHERE id = 501;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 501 campo opcion_d: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_b = replace(opcion_b, 'c ontrapulsación', 'contrapulsación') WHERE id = 502;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 502 campo opcion_b: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_a = replace(opcion_a, 'an giotensina', 'angiotensina') WHERE id = 505;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 505 campo opcion_a: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_c = replace(opcion_c, 'ob structivo', 'obstructivo') WHERE id = 511;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 511 campo opcion_c: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_d = replace(opcion_d, 'an tifibrótica', 'antifibrótica') WHERE id = 512;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 512 campo opcion_d: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_d = replace(opcion_d, 'o xigenoterapia', 'oxigenoterapia') WHERE id = 513;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 513 campo opcion_d: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_c = replace(opcion_c, 'intrahe pática', 'intrahepática') WHERE id = 520;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 520 campo opcion_c: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_d = replace(opcion_d, 'crea tinina', 'creatinina') WHERE id = 528;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 528 campo opcion_d: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_a = replace(opcion_a, 'plas maféresis', 'plasmaféresis') WHERE id = 531;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 531 campo opcion_a: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_c = replace(opcion_c, 'Hod gkin', 'Hodgkin') WHERE id = 535;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 535 campo opcion_c: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_b = replace(opcion_b, 'bi fosfonatos', 'bifosfonatos') WHERE id = 546;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 546 campo opcion_b: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_c = replace(opcion_c, 'indica do', 'indicado') WHERE id = 549;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 549 campo opcion_c: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_d = replace(opcion_d, 'criba do', 'cribado') WHERE id = 553;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 553 campo opcion_d: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_d = replace(opcion_d, 'azitromici na', 'azitromicina') WHERE id = 557;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 557 campo opcion_d: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_a = replace(opcion_a, 'hi polipemiante', 'hipolipemiante') WHERE id = 564;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 564 campo opcion_a: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_b = replace(opcion_b, 'a utólogo', 'autólogo') WHERE id = 566;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 566 campo opcion_b: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_c = replace(opcion_c, 'de xametasona', 'dexametasona') WHERE id = 570;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 570 campo opcion_c: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_a = replace(opcion_a, 'd iastólica', 'diastólica') WHERE id = 575;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 575 campo opcion_a: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_c = replace(opcion_c, 'espást ica', 'espástica') WHERE id = 581;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 581 campo opcion_c: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_d = replace(opcion_d, 'secunda ria', 'secundaria') WHERE id = 582;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 582 campo opcion_d: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_a = replace(opcion_a, 'co morbilidades', 'comorbilidades') WHERE id = 585;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 585 campo opcion_a: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_c = replace(opcion_c, 'ps oriasis', 'psoriasis') WHERE id = 585;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 585 campo opcion_c: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_b = replace(opcion_b, 'ungu eal', 'ungueal') WHERE id = 591;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 591 campo opcion_b: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_c = replace(opcion_c, 'combina r', 'combinar') WHERE id = 593;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 593 campo opcion_c: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET explicacion = replace(explicacion, 'glomerular es', 'glomerulares') WHERE id = 149;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 149 campo explicacion: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET explicacion = replace(explicacion, 'intralesional es', 'intralesionales') WHERE id = 175;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 175 campo explicacion: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET explicacion = replace(explicacion, 'vulvovaginal es', 'vulvovaginales') WHERE id = 251;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 251 campo explicacion: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET explicacion = replace(explicacion, 'humidificador es', 'humidificadores') WHERE id = 389;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 389 campo explicacion: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET explicacion = replace(explicacion, 'vestibular es', 'vestibulares') WHERE id = 397;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 397 campo explicacion: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET explicacion = replace(explicacion, 'secunda ria', 'secundaria') WHERE id = 399;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 399 campo explicacion: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET explicacion = replace(explicacion, 'peritoneal es', 'peritoneales') WHERE id = 399;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 399 campo explicacion: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET explicacion = replace(explicacion, 'basocelular es', 'basocelulares') WHERE id = 444;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 444 campo explicacion: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'vacunal es', 'vacunales') WHERE id = 465;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 465 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'r umiaciones', 'rumiaciones') WHERE id = 477;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 477 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'shoc k', 'shock') WHERE id = 502;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 502 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_b = replace(opcion_b, 'i SGLT', 'iSGLT') WHERE id = 505;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 505 campo opcion_b: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_d = replace(opcion_d, 'i SGLT', 'iSGLT') WHERE id = 505;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 505 campo opcion_d: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'C hild', 'Child') WHERE id = 520;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 520 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'ma croscópicamente', 'macroscópicamente') WHERE id = 525;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 525 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET explicacion = replace(explicacion, 'glomerular es', 'glomerulares') WHERE id = 529;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 529 campo explicacion: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'anis ocitosis', 'anisocitosis') WHERE id = 531;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 531 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'he miescroto', 'hemiescroto') WHERE id = 534;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 534 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'P rehn', 'Prehn') WHERE id = 534;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 534 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET explicacion = replace(explicacion, 'bi fosfonatos', 'bifosfonatos') WHERE id = 546;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 546 campo explicacion: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'infrapoplíte o', 'infrapoplíteo') WHERE id = 563;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 563 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'bacilosc opia', 'baciloscopia') WHERE id = 567;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 567 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_a = replace(opcion_a, 'di peptidil', 'dipeptidil') WHERE id = 576;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 576 campo opcion_a: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_d = replace(opcion_d, 'pa raqueratosis', 'paraqueratosis') WHERE id = 585;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 585 campo opcion_d: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'Electroneuromio grafía', 'Electroneuromiografía') WHERE id = 590;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 590 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET explicacion = replace(explicacion, 'contralateral es', 'contralaterales') WHERE id = 728;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 728 campo explicacion: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'poblacional es', 'poblacionales') WHERE id = 906;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 906 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET explicacion = replace(explicacion, 'comorbilidad es', 'comorbilidades') WHERE id = 954;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 954 campo explicacion: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'glomerular es', 'glomerulares') WHERE id = 989;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 989 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'de lentor no', 'del entorno') WHERE id = 543;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 543 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

END $$;

COMMIT;

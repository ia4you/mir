// Limitador en memoria por IP. Pensado para un único proceso Node en un VPS
// (sin Cloudflare ni Redis por delante, ver auditoría GA4 2026-09-18). Si
// algún día se despliega en varias réplicas, cada una llevaría su propio
// contador — para el volumen actual del sitio es una limitación aceptable.
const contadores = new Map();

// Limpieza periódica para no acumular IPs que ya no vuelven a pedir nada.
setInterval(() => {
  const ahora = Date.now();
  for (const [clave, entrada] of contadores) {
    if (entrada.reiniciaEn <= ahora) contadores.delete(clave);
  }
}, 10 * 60 * 1000).unref();

function ipDeRequest(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || null;
}

// Sin IP identificable, deja pasar: mejor fallar abierto que bloquear a
// todo el mundo bajo un mismo cubo "desconocida" si el proxy de Dokploy
// cambiara de headers.
export function comprobarLimite(request, { clave, limite, ventanaMs }) {
  const ip = ipDeRequest(request);
  if (!ip) return { permitido: true };

  const claveCompuesta = `${clave}:${ip}`;
  const ahora = Date.now();
  const entrada = contadores.get(claveCompuesta);

  if (!entrada || entrada.reiniciaEn <= ahora) {
    contadores.set(claveCompuesta, { cuenta: 1, reiniciaEn: ahora + ventanaMs });
    return { permitido: true };
  }
  if (entrada.cuenta >= limite) {
    return { permitido: false, reintentarEnSegundos: Math.ceil((entrada.reiniciaEn - ahora) / 1000) };
  }
  entrada.cuenta++;
  return { permitido: true };
}

import Link from "next/link";
import EnlaceConfigurarCookies from "../components/EnlaceConfigurarCookies";

export const metadata = {
  title: "Política de cookies — MIR Turel",
  description:
    "Qué cookies usa MIR Turel, para qué sirven, cuánto duran y cómo cambiar tu elección o borrarlas.",
  alternates: { canonical: "https://mir.turel.es/cookies" },
};

// Los nombres y duraciones de las cookies de sesión son los de producción
// (next-auth 4 con https: prefijos __Secure- y __Host-; sesión JWT de 30 días
// que se renueva al usar la web). Si cambia la configuración de next-auth o se
// añade otra herramienta, actualizar esta tabla y subir VERSION en
// app/lib/consentimiento.js para volver a pedir la elección.

const TECNICAS = [
  ["__Secure-next-auth.session-token", "Cookie", "Mantener tu sesión iniciada", "30 días desde tu última visita (se renueva al usar la web) o hasta que cierras sesión"],
  ["__Host-next-auth.csrf-token, __Secure-next-auth.callback-url", "Cookie", "Seguridad del inicio de sesión", "Hasta que cierras el navegador"],
  ["mir_consentimiento", "Almacenamiento local", "Recordar tu elección sobre cookies", "12 meses"],
  ["mir_tema, mir_meta_diaria, mir_temporizador_defecto", "Almacenamiento local", "Recordar tus preferencias: tema claro u oscuro, meta diaria y temporizador", "Hasta que las borres"],
  ["mir_disclaimer_aceptado, mir_push_banner_descartado", "Almacenamiento local", "No volver a mostrarte avisos que ya has cerrado", "Hasta que las borres"],
  ["mir_test_…", "Almacenamiento de sesión", "Guardar el test que estás haciendo", "Hasta que cierras la pestaña"],
];

const ANALISIS = [
  ["_ga, _ga_…", "Google Analytics 4 (Google Ireland Ltd.)", "Distinguir visitas y medir el uso de forma agregada", "2 años"],
  ["visitado_hoy_…", "MIR Turel (almacenamiento local)", "Contar una visita por día, sin identificarte", "1 día"],
];

function Tabla({ cabeceras, filas }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-track">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-panel text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            {cabeceras.map((c) => (
              <th key={c} scope="col" className="px-3 py-2 font-bold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f[0]} className="border-t border-track align-top">
              <td className="px-3 py-2 font-mono text-xs text-ink">{f[0]}</td>
              {f.slice(1).map((c, i) => (
                <td key={i} className="px-3 py-2 text-ink-muted">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-surface px-5 py-10 pb-32 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-accent">
          ← Volver a inicio
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">Política de cookies</h1>
        <p className="mt-3 text-sm text-ink-muted">Última actualización: 14 de octubre de 2026</p>

        <div className="mt-8 flex flex-col gap-8 text-ink-muted">
          <section>
            <p>
              Esta página explica qué cookies y tecnologías parecidas (como el almacenamiento local del
              navegador) usa MIR Turel (mir.turel.es), para qué sirven, cuánto duran y cómo puedes
              gestionarlas. El responsable es el mismo que figura en la{" "}
              <Link href="/privacidad" className="font-semibold text-accent">
                política de privacidad
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">Qué son</h2>
            <p className="mt-2">
              Las cookies son pequeños archivos que una web guarda en tu navegador. El almacenamiento local
              (localStorage y sessionStorage) cumple una función parecida. En esta página llamamos «cookies» a
              todo ello.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">Cookies técnicas (siempre activas)</h2>
            <p className="mt-2">Son necesarias para que la web funcione y no requieren tu consentimiento.</p>
            <Tabla cabeceras={["Nombre", "Tipo", "Para qué", "Duración"]} filas={TECNICAS} />
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">Cookies de análisis (solo si las aceptas)</h2>
            <p className="mt-2">
              Nos ayudan a saber cómo se usa la web (páginas visitadas, si se empiezan y terminan tests,
              registros…), siempre de forma agregada. No las usamos para publicidad.
            </p>
            <Tabla cabeceras={["Nombre", "Proveedor", "Para qué", "Duración"]} filas={ANALISIS} />
            <p className="mt-3">
              Más información sobre cómo trata Google estos datos:{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent"
              >
                política de privacidad de Google
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">Vídeos de YouTube</h2>
            <p className="mt-2">
              En la sección de vídeos y al fallar una pregunta puedes ver vídeos de YouTube. Antes de pulsar
              play no se carga nada de YouTube. Al pulsarlo, el reproductor se carga desde youtube-nocookie.com
              y YouTube puede guardar datos en tu navegador según su propia política. Ese contenido lo pides tú
              expresamente al pulsar play.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">Cómo cambiar tu elección o borrar las cookies</h2>
            <ul className="mt-2 flex list-disc flex-col gap-2 pl-5">
              <li>
                Puedes cambiar tu elección cuando quieras en{" "}
                <EnlaceConfigurarCookies className="font-semibold text-accent underline underline-offset-2" /> (también
                al pie de la portada y en tu perfil). Si retiras el consentimiento, dejamos de cargar Google
                Analytics y borramos sus cookies de este sitio.
              </li>
              <li>
                También puedes borrarlas desde tu navegador:{" "}
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent">
                  Chrome
                </a>
                ,{" "}
                <a href="https://support.mozilla.org/es/kb/Borrar%20cookies" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent">
                  Firefox
                </a>
                ,{" "}
                <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent">
                  Safari
                </a>{" "}
                y{" "}
                <a
                  href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-accent"
                >
                  Edge
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">Cambios</h2>
            <p className="mt-2">
              Si añadimos alguna cookie nueva, actualizaremos esta página y te volveremos a pedir tu elección.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

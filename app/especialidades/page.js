import Link from "next/link";
import { getEspecialidadesConConteo, resumenBanco, formatearMiles } from "../lib/especialidades";
import { breadcrumb } from "../lib/jsonld";
import { metaSocial } from "../lib/social";
import TarjetaEspecialidad from "../components/TarjetaEspecialidad";
import CtaPractica from "../components/CtaPractica";

// El build de Dokploy no tiene acceso a mir-db: SSR por request, no prerender.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const especialidades = await getEspecialidadesConConteo();
  const { total, anioMin, anioMax } = resumenBanco(especialidades);
  const title = `Preguntas MIR por especialidad (${formatearMiles(total)} oficiales) | MIR Turel`;
  const description = `Las ${formatearMiles(total)} preguntas oficiales del MIR ${anioMin}–${anioMax}, organizadas en ${especialidades.length} especialidades. Consulta cuántas preguntas tiene cada una y practica gratis por especialidad.`;
  return {
    title,
    description,
    alternates: { canonical: "https://mir.turel.es/especialidades" },
    ...metaSocial({ title, description, url: "https://mir.turel.es/especialidades" }),
  };
}

export default async function EspecialidadesPage() {
  const especialidades = await getEspecialidadesConConteo();
  const { total, anioMin, anioMax } = resumenBanco(especialidades);
  const maximo = Math.max(...especialidades.map((e) => e.total));

  const schemaMigas = breadcrumb([
    ["Inicio", "https://mir.turel.es/"],
    ["Especialidades", "https://mir.turel.es/especialidades"],
  ]);

  return (
    <div className="min-h-screen bg-surface px-5 py-10 sm:py-14 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMigas) }} />
      <div className="mx-auto max-w-2xl lg:max-w-[1240px]">
        <Link href="/" className="text-sm font-semibold text-accent">
          ← Volver a inicio
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          Preguntas MIR por especialidad
        </h1>

        <p className="mt-4 max-w-2xl text-ink-muted">
          {formatearMiles(total)} preguntas oficiales de las convocatorias {anioMin}–{anioMax} del
          Ministerio de Sanidad, repartidas en {especialidades.length} especialidades.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {especialidades.map((e) => (
            <TarjetaEspecialidad key={e.slug} especialidad={e} maximo={maximo} total={total} barraSiempre />
          ))}
        </div>

        <CtaPractica
          texto="Crear cuenta gratis"
          etiqueta="Practicar todas las especialidades"
          lote={{}}
          className="mx-auto mt-10 flex h-14 max-w-xs items-center justify-center rounded-2xl bg-brand px-6 text-lg font-bold text-on-brand shadow-sm active:bg-brand-dark lg:mx-0"
        />
      </div>
    </div>
  );
}

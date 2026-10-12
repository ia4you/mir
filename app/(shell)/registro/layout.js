import { getEspecialidadesConConteo, formatearMiles, resumenBanco } from "../../lib/especialidades";

// Recuento real de la BD, el mismo que la portada (sin anuladas).
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { total, anioMin, anioMax } = resumenBanco(await getEspecialidadesConConteo());
  return {
    title: "Crear cuenta gratis | MIR Turel",
    description: `Regístrate gratis en MIR Turel y empieza a practicar con ${formatearMiles(total)} preguntas oficiales del examen MIR ${anioMin}–${anioMax}.`,
    alternates: { canonical: "https://mir.turel.es/registro" },
  };
}

export default function RegistroLayout({ children }) {
  return children;
}

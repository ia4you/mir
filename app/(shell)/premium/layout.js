import { getEspecialidadesConConteo, formatearMiles, resumenBanco } from "../../lib/especialidades";

// Recuento real de la BD, el mismo que la portada (sin anuladas).
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { total } = resumenBanco(await getEspecialidadesConConteo());
  return {
    title: "Plan Premium | MIR Turel",
    description: `Accede a preguntas ilimitadas del examen MIR con el plan Premium de MIR Turel. Sin límite diario, acceso completo a las ${formatearMiles(total)} preguntas oficiales.`,
    alternates: { canonical: "https://mir.turel.es/premium" },
  };
}

export default function PremiumLayout({ children }) {
  return children;
}

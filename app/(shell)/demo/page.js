import Demo from "./Demo";
import { getEspecialidadesConConteo, resumenBanco, formatearMiles } from "../../lib/especialidades";

// Dinámica: el build no tiene acceso a la BD (ver /especialidades/[slug]).
export const dynamic = "force-dynamic";

export default async function DemoPage() {
  const { total } = resumenBanco(await getEspecialidadesConConteo());
  return <Demo totalBanco={formatearMiles(total)} />;
}

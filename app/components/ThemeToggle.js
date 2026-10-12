"use client";

import { useEffect, useState } from "react";
import Chip from "./Chip";
import { getTema, setTema, TEMA_POR_DEFECTO } from "../lib/preferencias";

const OPCIONES = [
  { valor: "oscuro", etiqueta: "Oscuro" },
  { valor: "claro", etiqueta: "Claro" },
];

export default function ThemeToggle() {
  const [tema, setTemaState] = useState(TEMA_POR_DEFECTO);

  useEffect(() => {
    setTemaState(getTema());
  }, []);

  function elegir(valor) {
    setTemaState(valor);
    setTema(valor);
  }

  return (
    <div className="flex gap-2">
      {OPCIONES.map((o) => (
        <Chip key={o.valor} activo={tema === o.valor} onClick={() => elegir(o.valor)}>
          {o.etiqueta}
        </Chip>
      ))}
    </div>
  );
}

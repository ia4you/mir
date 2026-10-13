"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { getTema, setTema, suscribirTema, TEMA_POR_DEFECTO } from "../lib/preferencias";

// Interruptor de tema de las cabeceras. Encendido = oscuro. Comparte estado
// con ThemeToggle (Perfil) a través de setTema/suscribirTema. Los colores son
// fijos por estado (no variables del tema) porque el propio control los
// representa. El botón mide 44px de alto/ancho mínimo; la pastilla, 52×28
// en móvil y 60×32 desde sm.
export default function ThemeSwitch() {
  const [tema, setTemaState] = useState(TEMA_POR_DEFECTO);
  const oscuro = tema === "oscuro";

  useEffect(() => {
    setTemaState(getTema());
    return suscribirTema(setTemaState);
  }, []);

  function cambiar() {
    const nuevo = oscuro ? "claro" : "oscuro";
    setTemaState(nuevo);
    setTema(nuevo);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={oscuro}
      aria-label="Tema oscuro"
      title="Cambiar a tema claro/oscuro"
      onClick={cambiar}
      className="flex h-11 min-w-[44px] flex-shrink-0 items-center justify-center rounded-full"
    >
      <span
        className={`flex h-7 w-[52px] items-center rounded-full border p-[3px] transition-colors duration-200 motion-reduce:transition-none sm:h-8 sm:w-[60px] ${
          oscuro ? "border-[#3A3D44] bg-[#1B1D21]" : "border-[#D9D3C6] bg-[#ECE8DF]"
        }`}
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition-transform duration-200 motion-reduce:transition-none sm:h-6 sm:w-6 ${
            oscuro ? "translate-x-6 bg-[#E3B95C] sm:translate-x-7" : "translate-x-0 bg-white"
          }`}
        >
          {oscuro ? (
            <Moon className="h-3 w-3 text-[#17130A] sm:h-3.5 sm:w-3.5" strokeWidth={2.5} aria-hidden="true" />
          ) : (
            <Sun className="h-3 w-3 text-[#8A6514] sm:h-3.5 sm:w-3.5" strokeWidth={2.5} aria-hidden="true" />
          )}
        </span>
      </span>
    </button>
  );
}

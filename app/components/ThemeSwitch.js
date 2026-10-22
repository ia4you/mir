"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { getTema, setTema, suscribirTema, TEMA_POR_DEFECTO } from "../lib/preferencias";

// Interruptor de tema de las cabeceras. Encendido = oscuro. Comparte estado
// con ThemeToggle (Perfil) a través de setTema/suscribirTema. Los colores son
// fijos por estado (no variables del tema) porque el propio control los
// representa. El botón mide 44px de alto/ancho mínimo; la pastilla, 52×28
// en móvil y 60×32 desde sm. Con `compactoMovil` (cabecera pública), por
// debajo de 405 px es un botón redondo de 40×40 con solo el icono.
export default function ThemeSwitch({ compactoMovil = false }) {
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
      className={`flex h-11 min-w-[44px] flex-shrink-0 items-center justify-center rounded-full ${
        compactoMovil
          ? `max-[404px]:h-10 max-[404px]:w-10 max-[404px]:min-w-0 max-[404px]:border ${
              oscuro ? "max-[404px]:border-[#3A3D44] max-[404px]:bg-[#1B1D21]" : "max-[404px]:border-[#D9D3C6] max-[404px]:bg-[#ECE8DF]"
            }`
          : ""
      }`}
    >
      {compactoMovil && (
        <span className="hidden max-[404px]:flex" aria-hidden="true">
          {oscuro ? (
            <Moon className="h-5 w-5 text-[#E3B95C]" strokeWidth={2.25} />
          ) : (
            <Sun className="h-5 w-5 text-[#8A6514]" strokeWidth={2.25} />
          )}
        </span>
      )}
      <span
        className={`${compactoMovil ? "max-[404px]:hidden " : ""}flex h-8 w-[58px] items-center rounded-full border p-[3px] transition-colors duration-200 motion-reduce:transition-none sm:h-9 sm:w-[68px] ${
          oscuro ? "border-[#3A3D44] bg-[#1B1D21]" : "border-[#D9D3C6] bg-[#ECE8DF]"
        }`}
      >
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-transform duration-200 motion-reduce:transition-none sm:h-7 sm:w-7 ${
            oscuro ? "translate-x-[26px] bg-[#E3B95C] sm:translate-x-8" : "translate-x-0 bg-white"
          }`}
        >
          {oscuro ? (
            <Moon className="h-3.5 w-3.5 text-[#17130A] sm:h-4 sm:w-4" strokeWidth={2.5} aria-hidden="true" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-[#8A6514] sm:h-4 sm:w-4" strokeWidth={2.5} aria-hidden="true" />
          )}
        </span>
      </span>
    </button>
  );
}

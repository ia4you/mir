"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

// Debe coincidir con el precio mostrado en /premium (app/(shell)/premium/page.js).
// No se consulta a la API de Stripe para no añadir una llamada de red extra
// en esta página; si cambia el precio del plan, actualizar también aquí.
const PRECIO_PREMIUM = 9.99;
const MONEDA_PREMIUM = "EUR";

function ContenidoSuccess() {
  const { update } = useSession();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // el plan se guarda en el JWT en el login; tras pagar hay que releerlo
    // de la BD para que Perfil y los límites reflejen premium sin tener que
    // cerrar y volver a abrir sesión
    update();
  }, [update]);

  useEffect(() => {
    if (!sessionId) return;
    // Guarda por session_id: evita un "purchase" duplicado si el usuario
    // recarga esta página con la misma sesión de Stripe en la URL (GA4
    // también deduplica por transaction_id, pero esto evita el envío).
    const clave = `mir_purchase_tracked_${sessionId}`;
    if (sessionStorage.getItem(clave)) return;
    if (typeof window.gtag === "function") {
      window.gtag("event", "purchase", {
        transaction_id: sessionId,
        value: PRECIO_PREMIUM,
        currency: MONEDA_PREMIUM,
        items: [{ item_name: "Premium mensual" }],
      });
    }
    sessionStorage.setItem(clave, "1");
  }, [sessionId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pb-10 pt-safe text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-3xl">
        🎉
      </div>
      <h1 className="mt-5 text-2xl font-extrabold text-ink">¡Ya eres usuario Premium! 🎉</h1>
      <p className="mt-2 text-ink-muted">
        Tu plan se ha activado correctamente. Ya puedes practicar sin límites.
      </p>

      <Link
        href="/inicio"
        className="mt-8 flex h-14 w-full max-w-xs items-center justify-center rounded-2xl bg-brand px-6 text-lg font-bold text-white shadow-sm active:bg-brand-dark"
      >
        Empezar a practicar
      </Link>

      <p className="mt-6 text-xs text-ink-muted">
        Recibirás un email de confirmación de Stripe.
      </p>
    </div>
  );
}

export default function PremiumSuccess() {
  return (
    <Suspense fallback={null}>
      <ContenidoSuccess />
    </Suspense>
  );
}

import Link from "next/link";

export default function Premium() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-3xl">
        ⭐
      </div>
      <h1 className="mt-5 text-2xl font-extrabold text-ink">MIR Turel Premium</h1>
      <p className="mt-2 text-ink-muted">
        Próximamente — contacta con nosotros para acceso ilimitado mientras preparamos el
        pago online.
      </p>
      <Link
        href="/inicio"
        className="mt-6 flex h-12 w-full max-w-xs items-center justify-center rounded-2xl bg-brand font-bold text-white"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

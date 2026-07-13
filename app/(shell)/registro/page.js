"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import FieldCard from "../../components/FieldCard";
import Logo from "../../components/Logo";

export default function Registro() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false);

  async function registrar(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se ha podido crear la cuenta.");
        setEnviando(false);
        return;
      }

      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        router.push("/login");
        return;
      }
      router.refresh();
      setEnviando(false);
      setMostrarBienvenida(true);
    } catch {
      setError("No se ha podido crear la cuenta. Inténtalo de nuevo.");
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen pb-10">
      <header className="px-5 pt-safe text-center">
        <Logo className="mx-auto h-16 w-auto" />
        <p className="mt-2 text-ink-muted">Empieza a practicar gratis</p>
      </header>

      <form onSubmit={registrar} className="mt-6 flex flex-col gap-4 px-5">
        <FieldCard label="Nombre">
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="h-12 w-full rounded-xl border border-track bg-white px-4 font-medium text-ink focus:border-brand focus:outline-none"
            placeholder="Tu nombre"
          />
        </FieldCard>

        <FieldCard label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-xl border border-track bg-white px-4 font-medium text-ink focus:border-brand focus:outline-none"
            placeholder="tu@email.com"
          />
        </FieldCard>

        <FieldCard label="Contraseña">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-xl border border-track bg-white px-4 font-medium text-ink focus:border-brand focus:outline-none"
            placeholder="Mínimo 6 caracteres"
          />
        </FieldCard>

        <FieldCard label="Confirmar contraseña">
          <input
            type="password"
            required
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            className="h-12 w-full rounded-xl border border-track bg-white px-4 font-medium text-ink focus:border-brand focus:outline-none"
            placeholder="Repite la contraseña"
          />
        </FieldCard>

        {error && (
          <p className="rounded-2xl bg-danger-bg p-4 text-sm font-semibold text-danger-text">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="h-14 w-full rounded-2xl bg-brand text-lg font-bold text-white shadow-sm active:bg-brand-dark disabled:opacity-60"
        >
          {enviando ? "Creando cuenta…" : "Crear cuenta"}
        </button>

        <p className="text-center text-sm text-ink-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-brand">
            Inicia sesión
          </Link>
        </p>
      </form>

      {mostrarBienvenida && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/40 px-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
            <p className="text-xl font-extrabold text-ink">¡Bienvenido/a a MIR Turel! 🎉</p>
            <p className="mt-2 font-semibold text-ink">Estás en el plan gratuito.</p>

            <ul className="mt-4 flex flex-col gap-2 text-left text-sm text-ink">
              <li className="flex items-start gap-2">
                <span className="text-brand">•</span> Hasta 10 preguntas por día
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand">•</span> Acceso a las 21 especialidades
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand">•</span> Historial y estadísticas incluidos
              </li>
            </ul>

            <p className="mt-4 text-sm font-semibold text-ink">
              ¿Quieres practicar sin límites?
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => router.push("/premium")}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-brand font-bold text-white shadow-sm active:bg-brand-dark"
              >
                Hazte Premium →
              </button>
              <button
                type="button"
                onClick={() => router.push("/inicio")}
                className="h-12 w-full rounded-xl border border-track font-bold text-ink"
              >
                Empezar gratis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

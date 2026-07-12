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
      router.push("/inicio");
      router.refresh();
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
    </div>
  );
}

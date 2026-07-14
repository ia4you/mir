"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PESTANAS = [
  { href: "/admin", label: "Usuarios" },
  { href: "/admin/contacto", label: "Mensajes" },
  { href: "/admin/lista-espera", label: "Lista de espera" },
];

export default function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-track px-5">
      {PESTANAS.map((p) => {
        const activa = pathname === p.href;
        return (
          <Link
            key={p.href}
            href={p.href}
            className={`flex-shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold ${
              activa ? "border-brand text-brand" : "border-transparent text-ink-muted"
            }`}
          >
            {p.label}
          </Link>
        );
      })}
    </nav>
  );
}

import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const TIPOS_PERMITIDOS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5MB
const DIRECTORIO_UPLOADS = path.join(process.cwd(), "public", "blog", "uploads");

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const archivo = formData.get("file");
  if (!archivo || typeof archivo === "string") {
    return NextResponse.json({ error: "No se ha recibido ninguna imagen." }, { status: 400 });
  }

  const extension = TIPOS_PERMITIDOS[archivo.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Formato no soportado. Usa JPG, PNG, WEBP o GIF." },
      { status: 400 }
    );
  }
  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    return NextResponse.json(
      { error: "La imagen supera el tamaño máximo permitido (5MB)." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await archivo.arrayBuffer());

  await mkdir(DIRECTORIO_UPLOADS, { recursive: true });
  // Nombre generado (nunca el nombre original del cliente): evita colisiones y
  // path traversal.
  const nombreArchivo = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${extension}`;
  await writeFile(path.join(DIRECTORIO_UPLOADS, nombreArchivo), buffer);

  return NextResponse.json({ url: `/blog/uploads/${nombreArchivo}` });
}

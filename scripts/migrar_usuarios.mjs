// migrar_usuarios.mjs
// -------------------------------
// Migración a multiusuario:
//   1. Crea la tabla `usuarios`.
//   2. Añade `user_id` a `sesiones` y `respuestas_sesion`.
//   3. Crea a José y Yésica como usuarios premium (contraseña hasheada con
//      bcrypt, nunca en texto plano).
//   4. Migra las sesiones/respuestas existentes (datos previos a la
//      autenticación) al usuario José.
//   5. Deja `user_id` como NOT NULL una vez migrado, para que a partir de
//      ahora sea obligatorio en filas nuevas.
//
// Uso:
//   node --env-file=.env.local scripts/migrar_usuarios.mjs

import { Client } from "pg";
import bcrypt from "bcryptjs";

const USUARIOS = [
  { nombre: "José", email: "joserh65@gmail.com", password: "freekan1" },
  { nombre: "Yésica", email: "yesi4321@gmail.com", password: "freekan1" },
];

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("[1/5] Creando tabla usuarios...");
  await client.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      plan VARCHAR(20) DEFAULT 'free' NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("[2/5] Añadiendo user_id a sesiones y respuestas_sesion...");
  await client.query(`ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES usuarios(id);`);
  await client.query(`ALTER TABLE respuestas_sesion ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES usuarios(id);`);

  console.log("[3/5] Creando usuarios premium...");
  const ids = {};
  for (const u of USUARIOS) {
    const hash = await bcrypt.hash(u.password, 12);
    const { rows } = await client.query(
      `INSERT INTO usuarios (nombre, email, password_hash, plan)
       VALUES ($1, $2, $3, 'premium')
       ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre
       RETURNING id`,
      [u.nombre, u.email, hash]
    );
    ids[u.nombre] = rows[0].id;
    console.log(`  - ${u.nombre} (${u.email}) -> id ${rows[0].id}`);
  }

  console.log("[4/5] Migrando filas existentes a José...");
  const joseId = ids["José"];
  const resSesiones = await client.query(
    `UPDATE sesiones SET user_id = $1 WHERE user_id IS NULL`,
    [joseId]
  );
  const resRespuestas = await client.query(
    `UPDATE respuestas_sesion SET user_id = $1 WHERE user_id IS NULL`,
    [joseId]
  );
  console.log(`  - sesiones migradas: ${resSesiones.rowCount}`);
  console.log(`  - respuestas_sesion migradas: ${resRespuestas.rowCount}`);

  console.log("[5/5] Marcando user_id como obligatorio a partir de ahora...");
  await client.query(`ALTER TABLE sesiones ALTER COLUMN user_id SET NOT NULL;`);
  await client.query(`ALTER TABLE respuestas_sesion ALTER COLUMN user_id SET NOT NULL;`);

  console.log("\nListo.");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

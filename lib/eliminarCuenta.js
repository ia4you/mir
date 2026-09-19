import { pool } from "./db";

// Borrado en cascada de una cuenta y todo su rastro. Se usa tanto desde el
// autoservicio (/api/perfil/cuenta, con sesión) como desde el panel de admin
// (/api/admin/eliminacion-cuenta/[id]/procesar, al tramitar una solicitud
// llegada por /eliminar-cuenta).
export async function eliminarCuentaPorId(userId, email) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM respuestas_sesion WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM sesiones WHERE user_id = $1`, [userId]);
    // lista_espera_premium referencia usuarios(id) sin ON DELETE CASCADE: si
    // se omite, el DELETE de usuarios falla para cualquiera que se haya
    // apuntado alguna vez a la lista de espera de Premium.
    await client.query(`DELETE FROM lista_espera_premium WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM lista_espera WHERE email = $1`, [email]);
    await client.query(`DELETE FROM contacto WHERE email = $1`, [email]);
    await client.query(`DELETE FROM usuarios WHERE id = $1`, [userId]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Borrado directo desde el panel de admin (botón "Borrar" en /admin). A
// diferencia de eliminarCuentaPorId, aquí sí se borra solicitudes_eliminacion
// — no es la tramitación de una solicitud del propio usuario (esa conserva
// el historial marcado `procesada`), es el admin decidiendo borrar la cuenta
// entera y todo su rastro directamente. También borra push_subscriptions de
// forma explícita en vez de depender de su ON DELETE CASCADE, para poder
// devolver cuántas filas se borraron de cada tabla en el resumen.
export async function eliminarUsuarioComoAdmin(userId, email) {
  const client = await pool.connect();
  const conteos = {};
  try {
    await client.query("BEGIN");
    const del = async (tabla, sql, params) => {
      const r = await client.query(sql, params);
      conteos[tabla] = r.rowCount;
    };
    await del("respuestas_sesion", `DELETE FROM respuestas_sesion WHERE user_id = $1`, [userId]);
    await del("push_subscriptions", `DELETE FROM push_subscriptions WHERE user_id = $1`, [
      userId,
    ]);
    await del("sesiones", `DELETE FROM sesiones WHERE user_id = $1`, [userId]);
    await del(
      "lista_espera_premium",
      `DELETE FROM lista_espera_premium WHERE user_id = $1`,
      [userId]
    );
    await del("lista_espera", `DELETE FROM lista_espera WHERE email = $1`, [email]);
    await del("contacto", `DELETE FROM contacto WHERE email = $1`, [email]);
    await del(
      "solicitudes_eliminacion",
      `DELETE FROM solicitudes_eliminacion WHERE email = $1`,
      [email]
    );
    await del("usuarios", `DELETE FROM usuarios WHERE id = $1`, [userId]);
    await client.query("COMMIT");
    return conteos;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

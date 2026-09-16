// stripe_setup_producto.mjs
// -------------------------------
// Crea el producto "MIR Turel Premium" y su precio recurrente de 4,99€/mes
// en Stripe (modo test o live según la clave usada). Idempotente: si ya
// existe un producto con ese nombre activo, reutiliza el primero que
// encuentre en vez de duplicarlo.
//
// Uso:
//   node --env-file=.env.local scripts/stripe_setup_producto.mjs

import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const NOMBRE_PRODUCTO = "MIR Turel Premium";

// Este script crea productos/precios reales. Si la clave es de producción
// (sk_live_), exige confirmación explícita en terminal para evitar
// ejecutarlo sin querer contra la cuenta real de Stripe.
async function confirmarSiClaveLive() {
  const clave = process.env.STRIPE_SECRET_KEY || "";
  if (!clave.startsWith("sk_live_")) return;

  const rl = readline.createInterface({ input: stdin, output: stdout });
  const respuesta = await rl.question(
    "Esto va a tocar Stripe EN PRODUCCIÓN (live). Escribe CONFIRMAR para continuar: "
  );
  rl.close();

  if (respuesta !== "CONFIRMAR") {
    console.error("Cancelado: no se ha confirmado la ejecución contra Stripe live.");
    process.exit(1);
  }
}

async function main() {
  await confirmarSiClaveLive();
  const existentes = await stripe.products.search({
    query: `name:"${NOMBRE_PRODUCTO}" AND active:"true"`,
  });

  let producto = existentes.data[0];
  if (producto) {
    console.log(`Producto ya existe: ${producto.id}`);
  } else {
    producto = await stripe.products.create({
      name: NOMBRE_PRODUCTO,
      description: "Preguntas ilimitadas, simulacros completos y acceso sin límite diario.",
    });
    console.log(`Producto creado: ${producto.id}`);
  }

  const precios = await stripe.prices.list({ product: producto.id, active: true });
  let precio = precios.data.find(
    (p) => p.unit_amount === 499 && p.currency === "eur" && p.recurring?.interval === "month"
  );

  if (precio) {
    console.log(`Precio ya existe: ${precio.id}`);
  } else {
    precio = await stripe.prices.create({
      product: producto.id,
      unit_amount: 499,
      currency: "eur",
      recurring: { interval: "month" },
    });
    console.log(`Precio creado: ${precio.id}`);
  }

  console.log("\nSTRIPE_PRICE_ID=" + precio.id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

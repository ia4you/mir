// stripe_setup_webhook.mjs
// -------------------------------
// Crea (o reutiliza) el webhook endpoint de producción en Stripe.
// El secreto solo se puede leer en el momento de creación, así que hay
// que guardarlo entonces (Stripe no lo vuelve a mostrar después).
//
// Uso:
//   node --env-file=.env.local scripts/stripe_setup_webhook.mjs

import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const URL_WEBHOOK = "https://mir.turel.es/api/webhooks/stripe";
const EVENTOS = [
  "checkout.session.completed",
  "customer.subscription.deleted",
  "customer.subscription.updated",
];

// Este script crea un webhook endpoint real en Stripe. Si la clave es de
// producción (sk_live_), exige confirmación explícita en terminal para
// evitar ejecutarlo sin querer contra la cuenta real de Stripe.
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
  const existentes = await stripe.webhookEndpoints.list({ limit: 100 });
  const existente = existentes.data.find((w) => w.url === URL_WEBHOOK);

  if (existente) {
    console.log(`Webhook ya existe: ${existente.id} (${existente.url})`);
    console.log("El secreto (whsec_...) no se puede volver a leer — si no lo tienes guardado,");
    console.log("borra este endpoint en el dashboard y vuelve a ejecutar este script.");
    return;
  }

  const webhook = await stripe.webhookEndpoints.create({
    url: URL_WEBHOOK,
    enabled_events: EVENTOS,
    description: "MIR Turel — actualiza plan premium/free tras eventos de suscripción",
  });

  console.log(`Webhook creado: ${webhook.id}`);
  console.log("STRIPE_WEBHOOK_SECRET=" + webhook.secret);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

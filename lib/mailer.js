import nodemailer from "nodemailer";

// mail.turel.es se usa en el puerto 25 (en 587/465 su ruta de auth sobre TLS
// es intermitente; ver scripts/test_smtp.mjs). Aun así, en el 25 el servidor
// ofrece STARTTLS y nodemailer lo usa siempre que puede; como el certificado
// del servidor es autofirmado, a veces fallaba con "self-signed certificate"
// (visto en producción el 2026-10-14). `rejectUnauthorized: false` mantiene
// el cifrado pero acepta ese certificado, así no se envía la contraseña en
// claro y el envío deja de depender de esa intermitencia.
export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 10000,
});

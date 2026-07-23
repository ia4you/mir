"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

// Contraparte nativa de PushBanner.js (que es solo para PWA/navegador): en
// la app Android pedimos el permiso directamente al abrir, sin banner.
export default function AndroidPushRegister() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return;

    let listeners = [];

    (async () => {
      const { PushNotifications } = await import("@capacitor/push-notifications");

      listeners.push(
        await PushNotifications.addListener("registration", async (token) => {
          try {
            await fetch("/api/push/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                platform: "android",
                subscription: { token: token.value },
              }),
            });
          } catch {
            // sin conexión o fallo puntual: el usuario simplemente no queda
            // suscrito esta vez, no hay nada más que mostrar aquí
          }
        })
      );
      listeners.push(
        await PushNotifications.addListener("registrationError", (err) => {
          console.error("Error de registro de notificaciones push:", err);
        })
      );

      let estado = await PushNotifications.checkPermissions();
      if (estado.receive === "prompt" || estado.receive === "prompt-with-rationale") {
        estado = await PushNotifications.requestPermissions();
      }
      if (estado.receive === "granted") {
        await PushNotifications.register();
      }
    })();

    return () => {
      listeners.forEach((l) => l.remove());
    };
  }, []);

  return null;
}

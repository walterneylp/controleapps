import { Router } from "express";
import { requireAuth } from "../../core/http/auth.middleware.js";
import { attachmentsStore } from "../attachments/attachments.store.js";
import { inventoryStore } from "../inventory/inventory.store.js";
import { subscriptionsStore } from "../subscriptions/subscriptions.store.js";

export const alertsRouter = Router();

alertsRouter.get("/alerts", requireAuth, async (_req, res) => {
  const apps = await inventoryStore.listApps();

  const alertsPerApp = await Promise.all(
    apps.map(async (app) => {
      const [hostings, domains, integrations, subscriptions, attachments] = await Promise.all([
        inventoryStore.listHostings(app.id),
        inventoryStore.listDomains(app.id),
        inventoryStore.listIntegrations(app.id),
        subscriptionsStore.list(app.id),
        attachmentsStore.list(app.id)
      ]);

      const alerts: Array<{ appId: string; severity: "media" | "alta"; code: string; message: string }> = [];

      if (hostings.length === 0) {
        alerts.push({
          appId: app.id,
          severity: "alta",
          code: "MISSING_HOSTING",
          message: "App sem hospedagem cadastrada"
        });
      }

      if (domains.length === 0) {
        alerts.push({
          appId: app.id,
          severity: "alta",
          code: "MISSING_DOMAIN",
          message: "App sem dominio cadastrado"
        });
      }

      if (integrations.length === 0) {
        alerts.push({
          appId: app.id,
          severity: "media",
          code: "MISSING_INTEGRATION",
          message: "App sem integracoes IA/API"
        });
      }

      if (subscriptions.length === 0) {
        alerts.push({
          appId: app.id,
          severity: "media",
          code: "MISSING_SUBSCRIPTION",
          message: "App sem assinatura tecnica cadastrada"
        });
      }

      if (attachments.length === 0) {
        alerts.push({
          appId: app.id,
          severity: "media",
          code: "MISSING_ATTACHMENT",
          message: "App sem anexos"
        });
      }

      return alerts;
    })
  );

  const items = alertsPerApp.flat();

  res.status(200).json({ items });
});

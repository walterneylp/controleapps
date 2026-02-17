import { Router } from "express";
import { requireAuth } from "../../core/http/auth.middleware.js";
import { attachmentsStore } from "../attachments/attachments.store.js";
import { inventoryStore } from "../inventory/inventory.store.js";
import { subscriptionsStore } from "../subscriptions/subscriptions.store.js";

export const alertsRouter = Router();

alertsRouter.get("/alerts", requireAuth, (_req, res) => {
  const apps = inventoryStore.listApps();

  const items = apps.flatMap((app) => {
    const alerts: Array<{ appId: string; severity: "media" | "alta"; code: string; message: string }> = [];

    if (inventoryStore.listHostings(app.id).length === 0) {
      alerts.push({
        appId: app.id,
        severity: "alta",
        code: "MISSING_HOSTING",
        message: "App sem hospedagem cadastrada"
      });
    }

    if (inventoryStore.listDomains(app.id).length === 0) {
      alerts.push({
        appId: app.id,
        severity: "alta",
        code: "MISSING_DOMAIN",
        message: "App sem dominio cadastrado"
      });
    }

    if (inventoryStore.listIntegrations(app.id).length === 0) {
      alerts.push({
        appId: app.id,
        severity: "media",
        code: "MISSING_INTEGRATION",
        message: "App sem integracoes IA/API"
      });
    }

    if (subscriptionsStore.list(app.id).length === 0) {
      alerts.push({
        appId: app.id,
        severity: "media",
        code: "MISSING_SUBSCRIPTION",
        message: "App sem assinatura tecnica cadastrada"
      });
    }

    if (attachmentsStore.list(app.id).length === 0) {
      alerts.push({
        appId: app.id,
        severity: "media",
        code: "MISSING_ATTACHMENT",
        message: "App sem anexos"
      });
    }

    return alerts;
  });

  res.status(200).json({ items });
});

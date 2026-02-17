import { Router } from "express";
import { HttpError } from "../../core/http/errors.js";
import { requireAuth, requireRole } from "../../core/http/auth.middleware.js";
import type { AuthenticatedRequest } from "../../core/http/types.js";
import { auditService } from "../audit/audit.service.js";
import { inventoryStore } from "../inventory/inventory.store.js";
import { subscriptionsStore } from "./subscriptions.store.js";
import { asString } from "../../shared/http.js";

export const subscriptionsRouter = Router();

subscriptionsRouter.get("/subscriptions", requireAuth, async (req, res) => {
  const appId = asString(req.query.appId).trim();
  res.status(200).json({ items: await subscriptionsStore.list(appId || undefined) });
});

subscriptionsRouter.post("/subscriptions", requireAuth, requireRole(["admin", "editor"]), async (req: AuthenticatedRequest, res) => {
  const appId = String(req.body?.appId ?? "").trim();
  if (!(await inventoryStore.getApp(appId))) throw new HttpError(404, "App nao encontrado", "NOT_FOUND");

  const provider = String(req.body?.provider ?? "").trim();
  const cardHolderName = String(req.body?.cardHolderName ?? "").trim();
  const cardLast4 = String(req.body?.cardLast4 ?? "").trim();
  if (!provider || !cardHolderName || !/^\d{4}$/.test(cardLast4)) {
    throw new HttpError(400, "provider, cardHolderName e cardLast4(4 digitos) sao obrigatorios", "VALIDATION_ERROR");
  }

  const item = await subscriptionsStore.create({
    appId,
    provider,
    cardHolderName,
    cardLast4,
    recurrence: req.body?.recurrence === "anual" ? "anual" : "mensal"
  });

  void auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "create", resource: "subscriptions", resourceId: item.id });
  res.status(201).json(item);
});

subscriptionsRouter.put("/subscriptions/:id", requireAuth, requireRole(["admin", "editor"]), async (req: AuthenticatedRequest, res) => {
  const subscriptionId = asString(req.params.id);
  const updated = await subscriptionsStore.update(subscriptionId, req.body ?? {});
  if (!updated) throw new HttpError(404, "Assinatura nao encontrada", "NOT_FOUND");
  void auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "update", resource: "subscriptions", resourceId: updated.id });
  res.status(200).json(updated);
});

subscriptionsRouter.delete("/subscriptions/:id", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
  const subscriptionId = asString(req.params.id);
  const ok = await subscriptionsStore.delete(subscriptionId);
  if (!ok) throw new HttpError(404, "Assinatura nao encontrada", "NOT_FOUND");
  void auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "delete", resource: "subscriptions", resourceId: subscriptionId });
  res.status(204).send();
});

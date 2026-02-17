import { Router } from "express";
import { HttpError } from "../../core/http/errors.js";
import { requireAuth, requireRole } from "../../core/http/auth.middleware.js";
import type { AuthenticatedRequest } from "../../core/http/types.js";
import { auditService } from "../audit/audit.service.js";
import { inventoryStore } from "../inventory/inventory.store.js";
import { secretsService } from "./secrets.service.js";
import { asString } from "../../shared/http.js";

export const secretsRouter = Router();

secretsRouter.get("/secrets", requireAuth, (req, res) => {
  const appId = asString(req.query.appId).trim();
  if (!appId) throw new HttpError(400, "appId e obrigatorio", "VALIDATION_ERROR");
  res.status(200).json({ items: secretsService.listByApp(appId) });
});

secretsRouter.post("/secrets", requireAuth, requireRole(["admin", "editor"]), (req: AuthenticatedRequest, res) => {
  const appId = String(req.body?.appId ?? "").trim();
  if (!inventoryStore.getApp(appId)) throw new HttpError(404, "App nao encontrado", "NOT_FOUND");

  const label = String(req.body?.label ?? "").trim();
  const plainValue = String(req.body?.plainValue ?? "").trim();
  const kind = req.body?.kind;
  if (!label || !plainValue || (kind !== "ssh" && kind !== "domain" && kind !== "api_key")) {
    throw new HttpError(400, "kind, label e plainValue sao obrigatorios", "VALIDATION_ERROR");
  }

  const created = secretsService.create({ appId, kind, label, plainValue, metadata: req.body?.metadata ?? {} });
  auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "create", resource: "secrets", resourceId: created.id });
  res.status(201).json({ id: created.id, appId: created.appId, kind: created.kind, label: created.label, createdAt: created.createdAt, updatedAt: created.updatedAt });
});

secretsRouter.get("/secrets/:id/reveal", requireAuth, requireRole(["admin"]), (req: AuthenticatedRequest, res) => {
  const secretId = asString(req.params.id);
  const value = secretsService.reveal(secretId);
  if (!value) throw new HttpError(404, "Segredo nao encontrado", "NOT_FOUND");

  auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "view_secret", resource: "secrets", resourceId: secretId });
  res.status(200).json({ id: secretId, value });
});

secretsRouter.put("/secrets/:id", requireAuth, requireRole(["admin", "editor"]), (req: AuthenticatedRequest, res) => {
  const plainValue = String(req.body?.plainValue ?? "").trim();
  if (!plainValue) throw new HttpError(400, "plainValue e obrigatorio", "VALIDATION_ERROR");

  const secretId = asString(req.params.id);
  const updated = secretsService.update(secretId, plainValue);
  if (!updated) throw new HttpError(404, "Segredo nao encontrado", "NOT_FOUND");
  auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "update", resource: "secrets", resourceId: secretId });
  res.status(200).json({ id: updated.id, updatedAt: updated.updatedAt });
});

secretsRouter.delete("/secrets/:id", requireAuth, requireRole(["admin"]), (req: AuthenticatedRequest, res) => {
  const secretId = asString(req.params.id);
  const ok = secretsService.delete(secretId);
  if (!ok) throw new HttpError(404, "Segredo nao encontrado", "NOT_FOUND");
  auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "delete", resource: "secrets", resourceId: secretId });
  res.status(204).send();
});

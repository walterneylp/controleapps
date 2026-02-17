import { Router } from "express";
import { HttpError } from "../../core/http/errors.js";
import { requireAuth, requireRole } from "../../core/http/auth.middleware.js";
import type { AuthenticatedRequest } from "../../core/http/types.js";
import { auditService } from "../audit/audit.service.js";
import { inventoryStore } from "./inventory.store.js";
import { asString } from "../../shared/http.js";

export const inventoryRouter = Router();

inventoryRouter.get("/apps", requireAuth, (req, res) => {
  const search = asString(req.query.search).trim();
  const items = inventoryStore.listApps(search || undefined);
  res.status(200).json({ items });
});

inventoryRouter.post("/apps", requireAuth, requireRole(["admin", "editor"]), (req: AuthenticatedRequest, res) => {
  const name = String(req.body?.name ?? "").trim();
  const commercialName = String(req.body?.commercialName ?? "").trim();
  if (!name || !commercialName) {
    throw new HttpError(400, "name e commercialName sao obrigatorios", "VALIDATION_ERROR");
  }

  const item = inventoryStore.createApp({
    name,
    commercialName,
    description: String(req.body?.description ?? "").trim() || undefined,
    status: req.body?.status === "inativo" ? "inativo" : "ativo",
    tags: Array.isArray(req.body?.tags) ? req.body.tags.map(String) : [],
    owner: String(req.body?.owner ?? "").trim() || undefined
  });

  auditService.record({
    actorId: req.user?.id,
    actorEmail: req.user?.email,
    action: "create",
    resource: "apps",
    resourceId: item.id
  });

  res.status(201).json(item);
});

inventoryRouter.get("/apps/:id", requireAuth, (req, res) => {
  const appId = asString(req.params.id);
  const item = inventoryStore.getApp(appId);
  if (!item) throw new HttpError(404, "App nao encontrado", "NOT_FOUND");

  res.status(200).json({
    app: item,
    hostings: inventoryStore.listHostings(item.id),
    domains: inventoryStore.listDomains(item.id),
    integrations: inventoryStore.listIntegrations(item.id)
  });
});

inventoryRouter.put("/apps/:id", requireAuth, requireRole(["admin", "editor"]), (req: AuthenticatedRequest, res) => {
  const appId = asString(req.params.id);
  const updated = inventoryStore.updateApp(appId, {
    name: req.body?.name,
    commercialName: req.body?.commercialName,
    description: req.body?.description,
    status: req.body?.status,
    tags: req.body?.tags,
    owner: req.body?.owner
  });

  if (!updated) throw new HttpError(404, "App nao encontrado", "NOT_FOUND");

  auditService.record({
    actorId: req.user?.id,
    actorEmail: req.user?.email,
    action: "update",
    resource: "apps",
    resourceId: updated.id
  });

  res.status(200).json(updated);
});

inventoryRouter.delete("/apps/:id", requireAuth, requireRole(["admin"]), (req: AuthenticatedRequest, res) => {
  const appId = asString(req.params.id);
  const ok = inventoryStore.deleteApp(appId);
  if (!ok) throw new HttpError(404, "App nao encontrado", "NOT_FOUND");

  auditService.record({
    actorId: req.user?.id,
    actorEmail: req.user?.email,
    action: "delete",
    resource: "apps",
    resourceId: appId
  });

  res.status(204).send();
});

inventoryRouter.get("/hostings", requireAuth, (req, res) => {
  const appId = asString(req.query.appId).trim();
  res.status(200).json({ items: inventoryStore.listHostings(appId || undefined) });
});

inventoryRouter.post("/hostings", requireAuth, requireRole(["admin", "editor"]), (req: AuthenticatedRequest, res) => {
  const appId = String(req.body?.appId ?? "").trim();
  const provider = String(req.body?.provider ?? "").trim();
  const ip = String(req.body?.ip ?? "").trim();

  if (!inventoryStore.getApp(appId)) throw new HttpError(404, "App nao encontrado", "NOT_FOUND");
  if (!provider || !ip) throw new HttpError(400, "provider e ip sao obrigatorios", "VALIDATION_ERROR");

  const item = inventoryStore.createHosting({
    appId,
    provider,
    ip,
    type: req.body?.type === "Provedor" ? "Provedor" : "VPS",
    notes: String(req.body?.notes ?? "").trim() || undefined,
    region: String(req.body?.region ?? "").trim() || undefined
  });

  auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "create", resource: "hostings", resourceId: item.id });
  res.status(201).json(item);
});

inventoryRouter.put("/hostings/:id", requireAuth, requireRole(["admin", "editor"]), (req: AuthenticatedRequest, res) => {
  const hostingId = asString(req.params.id);
  const item = inventoryStore.updateHosting(hostingId, req.body ?? {});
  if (!item) throw new HttpError(404, "Hosting nao encontrado", "NOT_FOUND");
  auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "update", resource: "hostings", resourceId: item.id });
  res.status(200).json(item);
});

inventoryRouter.delete("/hostings/:id", requireAuth, requireRole(["admin"]), (req: AuthenticatedRequest, res) => {
  const hostingId = asString(req.params.id);
  const ok = inventoryStore.deleteHosting(hostingId);
  if (!ok) throw new HttpError(404, "Hosting nao encontrado", "NOT_FOUND");
  auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "delete", resource: "hostings", resourceId: hostingId });
  res.status(204).send();
});

inventoryRouter.get("/domains", requireAuth, (req, res) => {
  const appId = asString(req.query.appId).trim();
  res.status(200).json({ items: inventoryStore.listDomains(appId || undefined) });
});

inventoryRouter.post("/domains", requireAuth, requireRole(["admin", "editor"]), (req: AuthenticatedRequest, res) => {
  const appId = String(req.body?.appId ?? "").trim();
  if (!inventoryStore.getApp(appId)) throw new HttpError(404, "App nao encontrado", "NOT_FOUND");

  const domain = String(req.body?.domain ?? "").trim();
  const registrar = String(req.body?.registrar ?? "").trim();
  if (!domain || !registrar) throw new HttpError(400, "domain e registrar sao obrigatorios", "VALIDATION_ERROR");

  const item = inventoryStore.createDomain({
    appId,
    domain,
    registrar,
    status: req.body?.status === "expirado" ? "expirado" : req.body?.status === "pendente" ? "pendente" : "ativo",
    expiresAt: String(req.body?.expiresAt ?? "").trim() || undefined
  });

  auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "create", resource: "domains", resourceId: item.id });
  res.status(201).json(item);
});

inventoryRouter.put("/domains/:id", requireAuth, requireRole(["admin", "editor"]), (req: AuthenticatedRequest, res) => {
  const domainId = asString(req.params.id);
  const item = inventoryStore.updateDomain(domainId, req.body ?? {});
  if (!item) throw new HttpError(404, "Dominio nao encontrado", "NOT_FOUND");
  auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "update", resource: "domains", resourceId: item.id });
  res.status(200).json(item);
});

inventoryRouter.delete("/domains/:id", requireAuth, requireRole(["admin"]), (req: AuthenticatedRequest, res) => {
  const domainId = asString(req.params.id);
  const ok = inventoryStore.deleteDomain(domainId);
  if (!ok) throw new HttpError(404, "Dominio nao encontrado", "NOT_FOUND");
  auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "delete", resource: "domains", resourceId: domainId });
  res.status(204).send();
});

inventoryRouter.get("/integrations", requireAuth, (req, res) => {
  const appId = asString(req.query.appId).trim();
  res.status(200).json({ items: inventoryStore.listIntegrations(appId || undefined) });
});

inventoryRouter.post("/integrations", requireAuth, requireRole(["admin", "editor"]), (req: AuthenticatedRequest, res) => {
  const appId = String(req.body?.appId ?? "").trim();
  if (!inventoryStore.getApp(appId)) throw new HttpError(404, "App nao encontrado", "NOT_FOUND");

  const provider = String(req.body?.provider ?? "").trim();
  const integrationName = String(req.body?.integrationName ?? "").trim();
  if (!provider || !integrationName) {
    throw new HttpError(400, "provider e integrationName sao obrigatorios", "VALIDATION_ERROR");
  }

  const item = inventoryStore.createIntegration({
    appId,
    provider,
    integrationName,
    scope: String(req.body?.scope ?? "").trim() || undefined,
    secretRefId: String(req.body?.secretRefId ?? "").trim() || undefined
  });

  auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "create", resource: "integrations", resourceId: item.id });
  res.status(201).json(item);
});

inventoryRouter.put("/integrations/:id", requireAuth, requireRole(["admin", "editor"]), (req: AuthenticatedRequest, res) => {
  const integrationId = asString(req.params.id);
  const item = inventoryStore.updateIntegration(integrationId, req.body ?? {});
  if (!item) throw new HttpError(404, "Integracao nao encontrada", "NOT_FOUND");
  auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "update", resource: "integrations", resourceId: item.id });
  res.status(200).json(item);
});

inventoryRouter.delete("/integrations/:id", requireAuth, requireRole(["admin"]), (req: AuthenticatedRequest, res) => {
  const integrationId = asString(req.params.id);
  const ok = inventoryStore.deleteIntegration(integrationId);
  if (!ok) throw new HttpError(404, "Integracao nao encontrada", "NOT_FOUND");
  auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "delete", resource: "integrations", resourceId: integrationId });
  res.status(204).send();
});

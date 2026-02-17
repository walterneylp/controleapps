import { Router } from "express";
import { HttpError } from "../../core/http/errors.js";
import { requireAuth, requireRole } from "../../core/http/auth.middleware.js";
import type { AuthenticatedRequest } from "../../core/http/types.js";
import { inventoryStore } from "../inventory/inventory.store.js";
import { auditService } from "../audit/audit.service.js";
import { attachmentsStore } from "./attachments.store.js";
import { asString } from "../../shared/http.js";

export const attachmentsRouter = Router();

attachmentsRouter.get("/attachments", requireAuth, async (req, res) => {
  const appId = asString(req.query.appId).trim();
  res.status(200).json({ items: await attachmentsStore.list(appId || undefined) });
});

attachmentsRouter.post("/attachments", requireAuth, requireRole(["admin", "editor"]), async (req: AuthenticatedRequest, res) => {
  const appId = String(req.body?.appId ?? "").trim();
  if (!(await inventoryStore.getApp(appId))) throw new HttpError(404, "App nao encontrado", "NOT_FOUND");

  const fileName = String(req.body?.fileName ?? "").trim();
  const mimeType = String(req.body?.mimeType ?? "").trim();
  const sizeBytes = Number(req.body?.sizeBytes ?? 0);
  if (!fileName || !mimeType || sizeBytes <= 0) {
    throw new HttpError(400, "fileName, mimeType e sizeBytes sao obrigatorios", "VALIDATION_ERROR");
  }
  if (sizeBytes > 15 * 1024 * 1024) {
    throw new HttpError(400, "Arquivo excede limite de 15MB", "VALIDATION_ERROR");
  }

  const allowed = ["application/pdf", "text/plain", "image/png", "image/jpeg"];
  if (!allowed.includes(mimeType)) {
    throw new HttpError(400, "mimeType nao permitido", "VALIDATION_ERROR");
  }

  const storagePath = `documents/${appId}/${Date.now()}_${fileName.replace(/\s+/g, "_")}`;
  const item = await attachmentsStore.create({
    appId,
    fileName,
    mimeType,
    sizeBytes,
    storagePath,
    uploadedBy: req.user?.email,
    fileContentBase64: typeof req.body?.fileContentBase64 === "string" ? req.body.fileContentBase64 : undefined
  });

  void auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "create", resource: "attachments", resourceId: item.id });
  res.status(201).json(item);
});

attachmentsRouter.delete("/attachments/:id", requireAuth, requireRole(["admin", "editor"]), async (req: AuthenticatedRequest, res) => {
  const attachmentId = asString(req.params.id);
  const ok = await attachmentsStore.delete(attachmentId);
  if (!ok) throw new HttpError(404, "Anexo nao encontrado", "NOT_FOUND");
  void auditService.record({ actorId: req.user?.id, actorEmail: req.user?.email, action: "delete", resource: "attachments", resourceId: attachmentId });
  res.status(204).send();
});

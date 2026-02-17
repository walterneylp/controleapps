import { Router } from "express";
import { requireAuth, requireRole } from "../../core/http/auth.middleware.js";
import type { AuthenticatedRequest } from "../../core/http/types.js";
import { auditService } from "./audit.service.js";

export const auditRouter = Router();

auditRouter.get(
  "/audit-events",
  requireAuth,
  requireRole(["admin", "editor"]),
  (_req: AuthenticatedRequest, res) => {
    res.status(200).json({ items: auditService.list() });
  }
);

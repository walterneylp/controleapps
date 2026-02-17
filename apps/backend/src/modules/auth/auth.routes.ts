import { Router } from "express";
import { authService } from "./auth.service.js";
import { HttpError } from "../../core/http/errors.js";
import { auditService } from "../audit/audit.service.js";
import { requireAuth } from "../../core/http/auth.middleware.js";
import type { AuthenticatedRequest } from "../../core/http/types.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");

  if (!email || !password) {
    throw new HttpError(400, "Email e senha sao obrigatorios", "VALIDATION_ERROR");
  }

  const result = await authService.login({ email, password });

  if (!result) {
    await auditService.record({
      actorEmail: email,
      action: "login_failed",
      resource: "auth.login"
    });

    throw new HttpError(401, "Credenciais invalidas", "INVALID_CREDENTIALS");
  }

  await auditService.record({
    actorId: result.user.id,
    actorEmail: result.user.email,
    action: "login_success",
    resource: "auth.login"
  });

  res.status(200).json(result);
});

authRouter.get("/me", requireAuth, (req: AuthenticatedRequest, res) => {
  res.status(200).json({ user: req.user });
});

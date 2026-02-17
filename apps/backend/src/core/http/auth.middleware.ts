import type { NextFunction, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "./errors.js";
import type { AuthenticatedRequest, Role } from "./types.js";
import { authService } from "../../modules/auth/auth.service.js";
import { auditService } from "../../modules/audit/audit.service.js";

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace("Bearer ", "").trim();

  if (!token) {
    throw new UnauthorizedError();
  }

  authService
    .verifyToken(token)
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError("Token invalido ou expirado");
      }

      req.user = user;
      next();
    })
    .catch((err) => next(err));
}

export function requireRole(allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    if (!allowedRoles.includes(req.user.role)) {
      void auditService.record({
        actorId: req.user.id,
        actorEmail: req.user.email,
        action: "access_denied",
        resource: req.path,
        context: { required: allowedRoles, role: req.user.role }
      });

      throw new ForbiddenError();
    }

    next();
  };
}

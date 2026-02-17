import { Router } from "express";
import { requireAuth, requireRole } from "../../core/http/auth.middleware.js";
import { HttpError } from "../../core/http/errors.js";
import type { Role } from "../../core/http/types.js";
import type { AuthenticatedRequest } from "../../core/http/types.js";
import { supabaseRuntime } from "../../integrations/supabase.js";
import { auditService } from "../audit/audit.service.js";

interface SystemUserRecord {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailConfirmed: boolean;
  createdAt: string;
  lastSignInAt: string | null;
}

function roleFromMeta(appMeta: Record<string, unknown> | undefined, userMeta: Record<string, unknown> | undefined): Role {
  const roleCandidate = (appMeta?.role ?? userMeta?.role ?? "leitor") as string;
  if (roleCandidate === "admin" || roleCandidate === "editor" || roleCandidate === "leitor") {
    return roleCandidate;
  }
  return "leitor";
}

function mapUser(raw: Record<string, unknown>): SystemUserRecord {
  const appMeta = (raw.app_metadata as Record<string, unknown> | undefined) ?? {};
  const userMeta = (raw.user_metadata as Record<string, unknown> | undefined) ?? {};
  const email = String(raw.email ?? "");

  return {
    id: String(raw.id),
    email,
    name: String(userMeta.name ?? email ?? "Usuario"),
    role: roleFromMeta(appMeta, userMeta),
    emailConfirmed: Boolean(raw.email_confirmed_at),
    createdAt: String(raw.created_at ?? new Date().toISOString()),
    lastSignInAt: raw.last_sign_in_at ? String(raw.last_sign_in_at) : null
  };
}

function parseRole(input: unknown): Role {
  if (input === "admin" || input === "editor" || input === "leitor") return input;
  throw new HttpError(400, "role invalido", "VALIDATION_ERROR");
}

function ensureSupabaseAdmin() {
  if (!supabaseRuntime.serviceClient) {
    throw new HttpError(400, "Operacao disponivel apenas com Supabase configurado", "CONFIG_ERROR");
  }
  return supabaseRuntime.serviceClient;
}

export const usersRouter = Router();

usersRouter.get("/users", requireAuth, requireRole(["admin"]), async (_req, res) => {
  const client = ensureSupabaseAdmin();
  const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw new HttpError(500, error.message, "SUPABASE_ERROR");

  const items = (data.users ?? [])
    .map((item) => mapUser(item as unknown as Record<string, unknown>))
    .sort((a, b) => a.email.localeCompare(b.email));

  res.status(200).json({ items });
});

usersRouter.post("/users", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
  const client = ensureSupabaseAdmin();
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const name = String(req.body?.name ?? "").trim();
  const role = parseRole(req.body?.role);
  const password = String(req.body?.password ?? "");

  if (!email || !name || !password) {
    throw new HttpError(400, "email, name e password sao obrigatorios", "VALIDATION_ERROR");
  }

  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role },
    user_metadata: { name }
  });

  if (error || !data.user) throw new HttpError(400, error?.message ?? "Falha ao criar usuario", "SUPABASE_ERROR");

  void auditService.record({
    actorId: req.user?.id,
    actorEmail: req.user?.email,
    action: "create",
    resource: "users",
    resourceId: data.user.id
  });

  res.status(201).json(mapUser(data.user as unknown as Record<string, unknown>));
});

usersRouter.put("/users/:id", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
  const client = ensureSupabaseAdmin();
  const userId = String(req.params.id ?? "").trim();
  if (!userId) throw new HttpError(400, "id invalido", "VALIDATION_ERROR");

  const patch: {
    email?: string;
    password?: string;
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
  } = {};

  if (req.body?.email) patch.email = String(req.body.email).trim().toLowerCase();
  if (req.body?.password) patch.password = String(req.body.password);
  if (req.body?.role) patch.app_metadata = { role: parseRole(req.body.role) };
  if (req.body?.name) patch.user_metadata = { name: String(req.body.name).trim() };

  if (Object.keys(patch).length === 0) {
    throw new HttpError(400, "Nenhum campo para atualizar", "VALIDATION_ERROR");
  }

  const { data, error } = await client.auth.admin.updateUserById(userId, patch);
  if (error || !data.user) throw new HttpError(400, error?.message ?? "Falha ao atualizar usuario", "SUPABASE_ERROR");

  void auditService.record({
    actorId: req.user?.id,
    actorEmail: req.user?.email,
    action: "update",
    resource: "users",
    resourceId: userId
  });

  res.status(200).json(mapUser(data.user as unknown as Record<string, unknown>));
});

usersRouter.delete("/users/:id", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
  const client = ensureSupabaseAdmin();
  const userId = String(req.params.id ?? "").trim();
  if (!userId) throw new HttpError(400, "id invalido", "VALIDATION_ERROR");

  if (req.user?.id === userId) {
    throw new HttpError(400, "Nao e permitido excluir o proprio usuario logado", "VALIDATION_ERROR");
  }

  const { error } = await client.auth.admin.deleteUser(userId);
  if (error) throw new HttpError(400, error.message, "SUPABASE_ERROR");

  void auditService.record({
    actorId: req.user?.id,
    actorEmail: req.user?.email,
    action: "delete",
    resource: "users",
    resourceId: userId
  });

  res.status(204).send();
});

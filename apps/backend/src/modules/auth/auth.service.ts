import crypto from "node:crypto";
import { env } from "../../config/env.js";
import type { AuthUser } from "../../core/http/types.js";
import { supabaseRuntime } from "../../integrations/supabase.js";

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResult {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

interface DevUser extends AuthUser {
  password: string;
}

const devUsers: DevUser[] = [
  {
    id: "usr_admin",
    email: "admin@controle.local",
    name: "Administrador",
    role: "admin",
    password: "Admin@123"
  },
  {
    id: "usr_editor",
    email: "editor@controle.local",
    name: "Editor",
    role: "editor",
    password: "Editor@123"
  },
  {
    id: "usr_reader",
    email: "leitor@controle.local",
    name: "Leitor",
    role: "leitor",
    password: "Leitor@123"
  }
];

function roleFromSupabaseMetadata(user: Record<string, unknown>): AuthUser["role"] {
  const appMeta = (user.app_metadata as Record<string, unknown> | undefined) ?? {};
  const userMeta = (user.user_metadata as Record<string, unknown> | undefined) ?? {};
  const roleCandidate = (appMeta.role ?? userMeta.role ?? "leitor") as string;
  if (roleCandidate === "admin" || roleCandidate === "editor" || roleCandidate === "leitor") {
    return roleCandidate;
  }
  return "leitor";
}

function sign(payload: object): string {
  const rawPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", env.tokenSecret)
    .update(rawPayload)
    .digest("base64url");

  return `${rawPayload}.${signature}`;
}

function verify(token: string): Record<string, unknown> | null {
  const [rawPayload, signature] = token.split(".");
  if (!rawPayload || !signature) return null;

  const expected = crypto
    .createHmac("sha256", env.tokenSecret)
    .update(rawPayload)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(rawPayload, "base64url").toString("utf8")) as Record<string, unknown>;

  if (typeof payload.exp === "number" && Date.now() > payload.exp) {
    return null;
  }

  return payload;
}

export class AuthService {
  async login(input: LoginInput): Promise<LoginResult | null> {
    if (env.authMode === "supabase" && supabaseRuntime.authClient) {
      const { data, error } = await supabaseRuntime.authClient.auth.signInWithPassword({
        email: input.email,
        password: input.password
      });

      if (error || !data.session || !data.user) {
        return null;
      }

      const user = data.user as unknown as Record<string, unknown>;
      const mappedUser: AuthUser = {
        id: String(user.id),
        email: String(user.email ?? input.email),
        name: String((user.user_metadata as Record<string, unknown> | undefined)?.name ?? user.email ?? "Usuario"),
        role: roleFromSupabaseMetadata(user)
      };

      return {
        accessToken: data.session.access_token,
        expiresIn: data.session.expires_in ?? env.tokenTtlSeconds,
        user: mappedUser
      };
    }

    const user = devUsers.find((candidate) => candidate.email === input.email);
    if (!user || user.password !== input.password) {
      return null;
    }

    const exp = Date.now() + env.tokenTtlSeconds * 1000;

    const token = sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      exp
    });

    return {
      accessToken: token,
      expiresIn: env.tokenTtlSeconds,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    };
  }

  async verifyToken(token: string): Promise<AuthUser | null> {
    if (env.authMode === "supabase" && supabaseRuntime.authClient) {
      const { data, error } = await supabaseRuntime.authClient.auth.getUser(token);
      if (error || !data.user) return null;

      const user = data.user as unknown as Record<string, unknown>;
      return {
        id: String(user.id),
        email: String(user.email ?? ""),
        name: String((user.user_metadata as Record<string, unknown> | undefined)?.name ?? user.email ?? "Usuario"),
        role: roleFromSupabaseMetadata(user)
      };
    }

    const payload = verify(token);
    if (!payload) {
      return null;
    }

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }

    if (payload.role !== "admin" && payload.role !== "editor" && payload.role !== "leitor") {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name
    };
  }
}

export const authService = new AuthService();

import crypto from "node:crypto";
import { env } from "../../config/env.js";
import type { AuthUser } from "../../core/http/types.js";

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
  login(input: LoginInput): LoginResult | null {
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

  verifyToken(token: string): AuthUser | null {
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

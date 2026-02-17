import type { Request } from "express";

export type Role = "admin" | "editor" | "leitor";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

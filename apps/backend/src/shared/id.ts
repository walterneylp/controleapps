import crypto from "node:crypto";

export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

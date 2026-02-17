import crypto from "node:crypto";
import { createId } from "../../shared/id.js";

export interface SecretRecord {
  id: string;
  appId: string;
  kind: "ssh" | "domain" | "api_key";
  label: string;
  encryptedPayload: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

const KEY_HEX = process.env.SECRETS_ENCRYPTION_KEY_HEX ?? "";
const key = KEY_HEX.length === 64 ? Buffer.from(KEY_HEX, "hex") : crypto.createHash("sha256").update("dev-key-change-me").digest();

function encrypt(plainText: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decrypt(cipherText: string): string {
  const raw = Buffer.from(cipherText, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

class SecretsService {
  private items = new Map<string, SecretRecord>();

  listByApp(appId: string): Array<Omit<SecretRecord, "encryptedPayload">> {
    return [...this.items.values()]
      .filter((item) => item.appId === appId)
      .map(({ encryptedPayload: _encryptedPayload, ...rest }) => rest);
  }

  create(input: { appId: string; kind: SecretRecord["kind"]; label: string; plainValue: string; metadata?: Record<string, unknown> }): SecretRecord {
    const now = new Date().toISOString();
    const item: SecretRecord = {
      id: createId("sec"),
      appId: input.appId,
      kind: input.kind,
      label: input.label,
      encryptedPayload: encrypt(input.plainValue),
      metadata: input.metadata,
      createdAt: now,
      updatedAt: now
    };
    this.items.set(item.id, item);
    return item;
  }

  reveal(id: string): string | null {
    const item = this.items.get(id);
    if (!item) return null;
    return decrypt(item.encryptedPayload);
  }

  update(id: string, plainValue: string): SecretRecord | null {
    const current = this.items.get(id);
    if (!current) return null;
    const updated: SecretRecord = {
      ...current,
      encryptedPayload: encrypt(plainValue),
      updatedAt: new Date().toISOString()
    };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}

export const secretsService = new SecretsService();

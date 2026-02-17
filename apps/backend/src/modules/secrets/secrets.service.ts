import crypto from "node:crypto";
import { createId } from "../../shared/id.js";
import { supabaseRuntime } from "../../integrations/supabase.js";

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

function mapSecret(row: Record<string, unknown>): SecretRecord {
  return {
    id: String(row.id),
    appId: String(row.app_id),
    kind: row.kind as "ssh" | "domain" | "api_key",
    label: String(row.label),
    encryptedPayload: String(row.encrypted_payload),
    metadata: (row.metadata as Record<string, unknown> | null) ?? undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

class SecretsService {
  private items = new Map<string, SecretRecord>();

  async listByApp(appId: string): Promise<Array<Omit<SecretRecord, "encryptedPayload">>> {
    if (supabaseRuntime.serviceClient) {
      const { data } = await supabaseRuntime.serviceClient
        .from("access_secrets")
        .select("id, app_id, kind, label, metadata, created_at, updated_at")
        .eq("app_id", appId)
        .order("created_at", { ascending: false });

      return (data ?? []).map((row) => {
        const r = row as Record<string, unknown>;
        return {
          id: String(r.id),
          appId: String(r.app_id),
          kind: r.kind as "ssh" | "domain" | "api_key",
          label: String(r.label),
          metadata: (r.metadata as Record<string, unknown> | null) ?? undefined,
          createdAt: String(r.created_at),
          updatedAt: String(r.updated_at)
        };
      });
    }

    return [...this.items.values()]
      .filter((item) => item.appId === appId)
      .map(({ encryptedPayload: _encryptedPayload, ...rest }) => rest);
  }

  async create(input: { appId: string; kind: SecretRecord["kind"]; label: string; plainValue: string; metadata?: Record<string, unknown> }): Promise<SecretRecord> {
    if (supabaseRuntime.serviceClient) {
      const encrypted = encrypt(input.plainValue);
      const { data, error } = await supabaseRuntime.serviceClient
        .from("access_secrets")
        .insert({
          app_id: input.appId,
          kind: input.kind,
          label: input.label,
          encrypted_payload: encrypted,
          metadata: input.metadata ?? null
        })
        .select("*")
        .single();
      if (error || !data) throw new Error(error?.message ?? "Falha ao criar segredo");
      return mapSecret(data as Record<string, unknown>);
    }

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

  async reveal(id: string): Promise<string | null> {
    if (supabaseRuntime.serviceClient) {
      const { data } = await supabaseRuntime.serviceClient.from("access_secrets").select("encrypted_payload").eq("id", id).maybeSingle();
      if (!data?.encrypted_payload) return null;
      return decrypt(String(data.encrypted_payload));
    }

    const item = this.items.get(id);
    if (!item) return null;
    return decrypt(item.encryptedPayload);
  }

  async update(id: string, plainValue: string): Promise<SecretRecord | null> {
    if (supabaseRuntime.serviceClient) {
      const { data } = await supabaseRuntime.serviceClient
        .from("access_secrets")
        .update({ encrypted_payload: encrypt(plainValue), updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .maybeSingle();
      return data ? mapSecret(data as Record<string, unknown>) : null;
    }

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

  async delete(id: string): Promise<boolean> {
    if (supabaseRuntime.serviceClient) {
      const { error } = await supabaseRuntime.serviceClient.from("access_secrets").delete().eq("id", id);
      return !error;
    }

    return this.items.delete(id);
  }
}

export const secretsService = new SecretsService();

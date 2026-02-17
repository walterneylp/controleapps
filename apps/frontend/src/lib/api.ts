export type Role = "admin" | "editor" | "leitor";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    role: Role;
    name: string;
  };
}

export interface AppRecord {
  id: string;
  name: string;
  commercialName: string;
  description?: string;
  status: "ativo" | "inativo";
  tags: string[];
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HostingRecord {
  id: string;
  appId: string;
  provider: string;
  ip: string;
  type: "VPS" | "Provedor";
  region?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DomainRecord {
  id: string;
  appId: string;
  domain: string;
  registrar: string;
  status: "ativo" | "expirado" | "pendente";
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationRecord {
  id: string;
  appId: string;
  provider: string;
  integrationName: string;
  scope?: string;
  secretRefId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionRecord {
  id: string;
  appId: string;
  provider: string;
  cardHolderName: string;
  cardLast4: string;
  recurrence: "mensal" | "anual";
  createdAt: string;
  updatedAt: string;
}

export interface SecretRecord {
  id: string;
  appId: string;
  kind: "ssh" | "domain" | "api_key";
  label: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AttachmentRecord {
  id: string;
  appId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface AlertRecord {
  appId: string;
  severity: "media" | "alta";
  code: string;
  message: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3333/api";

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(init?.headers ? (init.headers as Record<string, string>) : {})
  };

  if (!(init?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Falha na requisicao");
  }

  return payload as T;
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Falha no login");
  }

  return payload as LoginResponse;
}

export async function listApps(token: string, search = ""): Promise<AppRecord[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const payload = await request<{ items: AppRecord[] }>(`/apps${query}`, token);
  return payload.items;
}

export async function createApp(token: string, input: { name: string; commercialName: string; description?: string }): Promise<AppRecord> {
  return request<AppRecord>("/apps", token, {
    method: "POST",
    body: JSON.stringify({ ...input, status: "ativo", tags: [] })
  });
}

export async function getAppDetail(token: string, id: string): Promise<{
  app: AppRecord;
  hostings: HostingRecord[];
  domains: DomainRecord[];
  integrations: IntegrationRecord[];
}> {
  return request(`/apps/${id}`, token);
}

export async function createHosting(
  token: string,
  input: { appId: string; provider: string; ip: string; type: "VPS" | "Provedor"; region?: string; notes?: string }
): Promise<HostingRecord> {
  return request<HostingRecord>("/hostings", token, { method: "POST", body: JSON.stringify(input) });
}

export async function createDomain(
  token: string,
  input: { appId: string; domain: string; registrar: string; status: "ativo" | "expirado" | "pendente"; expiresAt?: string }
): Promise<DomainRecord> {
  return request<DomainRecord>("/domains", token, { method: "POST", body: JSON.stringify(input) });
}

export async function createIntegration(
  token: string,
  input: { appId: string; provider: string; integrationName: string; scope?: string }
): Promise<IntegrationRecord> {
  return request<IntegrationRecord>("/integrations", token, { method: "POST", body: JSON.stringify(input) });
}

export async function listSubscriptions(token: string, appId: string): Promise<SubscriptionRecord[]> {
  const payload = await request<{ items: SubscriptionRecord[] }>(`/subscriptions?appId=${encodeURIComponent(appId)}`, token);
  return payload.items;
}

export async function createSubscription(
  token: string,
  input: { appId: string; provider: string; cardHolderName: string; cardLast4: string; recurrence: "mensal" | "anual" }
): Promise<SubscriptionRecord> {
  return request<SubscriptionRecord>("/subscriptions", token, { method: "POST", body: JSON.stringify(input) });
}

export async function listSecrets(token: string, appId: string): Promise<SecretRecord[]> {
  const payload = await request<{ items: SecretRecord[] }>(`/secrets?appId=${encodeURIComponent(appId)}`, token);
  return payload.items;
}

export async function createSecret(
  token: string,
  input: { appId: string; kind: "ssh" | "domain" | "api_key"; label: string; plainValue: string }
): Promise<SecretRecord> {
  return request<SecretRecord>("/secrets", token, { method: "POST", body: JSON.stringify(input) });
}

export async function revealSecret(token: string, secretId: string): Promise<{ id: string; value: string }> {
  return request<{ id: string; value: string }>(`/secrets/${secretId}/reveal`, token);
}

export async function listAttachments(token: string, appId: string): Promise<AttachmentRecord[]> {
  const payload = await request<{ items: AttachmentRecord[] }>(`/attachments?appId=${encodeURIComponent(appId)}`, token);
  return payload.items;
}

export async function createAttachment(
  token: string,
  input: { appId: string; fileName: string; mimeType: string; sizeBytes: number }
): Promise<AttachmentRecord> {
  return request<AttachmentRecord>("/attachments", token, { method: "POST", body: JSON.stringify(input) });
}

export async function listAuditEvents(token: string): Promise<unknown[]> {
  const payload = await request<{ items: unknown[] }>("/audit-events", token);
  return payload.items;
}

export async function listAlerts(token: string): Promise<AlertRecord[]> {
  const payload = await request<{ items: AlertRecord[] }>("/alerts", token);
  return payload.items;
}

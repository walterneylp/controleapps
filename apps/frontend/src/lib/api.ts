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

export interface SystemUserRecord {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailConfirmed: boolean;
  createdAt: string;
  lastSignInAt: string | null;
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

export async function createApp(
  token: string,
  input: {
    name: string;
    commercialName: string;
    description?: string;
    status?: "ativo" | "inativo";
    tags?: string[];
    owner?: string;
  }
): Promise<AppRecord> {
  return request<AppRecord>("/apps", token, {
    method: "POST",
    body: JSON.stringify({
      ...input,
      status: input.status ?? "ativo",
      tags: input.tags ?? []
    })
  });
}

export async function updateApp(
  token: string,
  appId: string,
  input: Partial<{ name: string; commercialName: string; description?: string; status: "ativo" | "inativo"; owner?: string; tags?: string[] }>
): Promise<AppRecord> {
  return request<AppRecord>(`/apps/${appId}`, token, {
    method: "PUT",
    body: JSON.stringify(input)
  });
}

export async function deleteApp(token: string, appId: string): Promise<void> {
  await request(`/apps/${appId}`, token, {
    method: "DELETE"
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

export async function updateHosting(
  token: string,
  hostingId: string,
  input: Partial<{ provider: string; ip: string; type: "VPS" | "Provedor"; region?: string; notes?: string }>
): Promise<HostingRecord> {
  return request<HostingRecord>(`/hostings/${hostingId}`, token, { method: "PUT", body: JSON.stringify(input) });
}

export async function deleteHosting(token: string, hostingId: string): Promise<void> {
  await request(`/hostings/${hostingId}`, token, { method: "DELETE" });
}

export async function createDomain(
  token: string,
  input: { appId: string; domain: string; registrar: string; status: "ativo" | "expirado" | "pendente"; expiresAt?: string }
): Promise<DomainRecord> {
  return request<DomainRecord>("/domains", token, { method: "POST", body: JSON.stringify(input) });
}

export async function updateDomain(
  token: string,
  domainId: string,
  input: Partial<{ domain: string; registrar: string; status: "ativo" | "expirado" | "pendente"; expiresAt?: string }>
): Promise<DomainRecord> {
  return request<DomainRecord>(`/domains/${domainId}`, token, { method: "PUT", body: JSON.stringify(input) });
}

export async function deleteDomain(token: string, domainId: string): Promise<void> {
  await request(`/domains/${domainId}`, token, { method: "DELETE" });
}

export async function createIntegration(
  token: string,
  input: { appId: string; provider: string; integrationName: string; scope?: string }
): Promise<IntegrationRecord> {
  return request<IntegrationRecord>("/integrations", token, { method: "POST", body: JSON.stringify(input) });
}

export async function updateIntegration(
  token: string,
  integrationId: string,
  input: Partial<{ provider: string; integrationName: string; scope?: string; secretRefId?: string }>
): Promise<IntegrationRecord> {
  return request<IntegrationRecord>(`/integrations/${integrationId}`, token, { method: "PUT", body: JSON.stringify(input) });
}

export async function deleteIntegration(token: string, integrationId: string): Promise<void> {
  await request(`/integrations/${integrationId}`, token, { method: "DELETE" });
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

export async function updateSubscription(
  token: string,
  subscriptionId: string,
  input: Partial<{ provider: string; cardHolderName: string; cardLast4: string; recurrence: "mensal" | "anual" }>
): Promise<SubscriptionRecord> {
  return request<SubscriptionRecord>(`/subscriptions/${subscriptionId}`, token, { method: "PUT", body: JSON.stringify(input) });
}

export async function deleteSubscription(token: string, subscriptionId: string): Promise<void> {
  await request(`/subscriptions/${subscriptionId}`, token, { method: "DELETE" });
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

export async function updateSecret(token: string, secretId: string, plainValue: string): Promise<{ id: string; updatedAt: string }> {
  return request<{ id: string; updatedAt: string }>(`/secrets/${secretId}`, token, {
    method: "PUT",
    body: JSON.stringify({ plainValue })
  });
}

export async function deleteSecret(token: string, secretId: string): Promise<void> {
  await request(`/secrets/${secretId}`, token, { method: "DELETE" });
}

export async function listAttachments(token: string, appId: string): Promise<AttachmentRecord[]> {
  const payload = await request<{ items: AttachmentRecord[] }>(`/attachments?appId=${encodeURIComponent(appId)}`, token);
  return payload.items;
}

export async function createAttachment(
  token: string,
  input: { appId: string; fileName: string; mimeType: string; sizeBytes: number; fileContentBase64?: string }
): Promise<AttachmentRecord> {
  return request<AttachmentRecord>("/attachments", token, { method: "POST", body: JSON.stringify(input) });
}

export async function deleteAttachment(token: string, attachmentId: string): Promise<void> {
  await request(`/attachments/${attachmentId}`, token, { method: "DELETE" });
}

export async function listAuditEvents(token: string): Promise<unknown[]> {
  const payload = await request<{ items: unknown[] }>("/audit-events", token);
  return payload.items;
}

export async function listAlerts(token: string): Promise<AlertRecord[]> {
  const payload = await request<{ items: AlertRecord[] }>("/alerts", token);
  return payload.items;
}

export async function listSystemUsers(token: string): Promise<SystemUserRecord[]> {
  const payload = await request<{ items: SystemUserRecord[] }>("/users", token);
  return payload.items;
}

export async function createSystemUser(
  token: string,
  input: { email: string; name: string; role: Role; password: string }
): Promise<SystemUserRecord> {
  return request<SystemUserRecord>("/users", token, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function updateSystemUser(
  token: string,
  userId: string,
  input: Partial<{ email: string; name: string; role: Role; password: string }>
): Promise<SystemUserRecord> {
  return request<SystemUserRecord>(`/users/${userId}`, token, {
    method: "PUT",
    body: JSON.stringify(input)
  });
}

export async function deleteSystemUser(token: string, userId: string): Promise<void> {
  await request(`/users/${userId}`, token, {
    method: "DELETE"
  });
}

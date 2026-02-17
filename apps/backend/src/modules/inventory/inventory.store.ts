import { createId } from "../../shared/id.js";
import { supabaseRuntime } from "../../integrations/supabase.js";
import type { AiIntegrationRecord, AppRecord, DomainRecord, HostingRecord } from "./inventory.types.js";

function mapApp(row: Record<string, unknown>): AppRecord {
  return {
    id: String(row.id),
    name: String(row.name),
    commercialName: String(row.commercial_name),
    description: (row.description as string | null) ?? undefined,
    status: (row.status as "ativo" | "inativo") ?? "ativo",
    tags: (row.tags as string[] | null) ?? [],
    owner: (row.owner as string | null) ?? undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapHosting(row: Record<string, unknown>): HostingRecord {
  return {
    id: String(row.id),
    appId: String(row.app_id),
    provider: String(row.provider),
    ip: String(row.ip),
    type: (row.type as "VPS" | "Provedor") ?? "VPS",
    region: (row.region as string | null) ?? undefined,
    notes: (row.notes as string | null) ?? undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapDomain(row: Record<string, unknown>): DomainRecord {
  return {
    id: String(row.id),
    appId: String(row.app_id),
    domain: String(row.domain),
    registrar: String(row.registrar),
    status: (row.status as "ativo" | "expirado" | "pendente") ?? "ativo",
    expiresAt: (row.expires_at as string | null) ?? undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapIntegration(row: Record<string, unknown>): AiIntegrationRecord {
  return {
    id: String(row.id),
    appId: String(row.app_id),
    provider: String(row.provider),
    integrationName: String(row.integration_name),
    scope: (row.scope as string | null) ?? undefined,
    secretRefId: (row.secret_ref_id as string | null) ?? undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

class InventoryStore {
  private apps = new Map<string, AppRecord>();
  private hostings = new Map<string, HostingRecord>();
  private domains = new Map<string, DomainRecord>();
  private integrations = new Map<string, AiIntegrationRecord>();

  async listApps(search?: string): Promise<AppRecord[]> {
    if (supabaseRuntime.serviceClient) {
      let query = supabaseRuntime.serviceClient.from("apps").select("*").order("created_at", { ascending: false });
      if (search) {
        query = query.or(`name.ilike.%${search}%,commercial_name.ilike.%${search}%`);
      }
      const { data } = await query;
      return (data ?? []).map((row) => mapApp(row as Record<string, unknown>));
    }

    const items = [...this.apps.values()];
    if (!search) return items;
    const term = search.toLowerCase();
    return items.filter((item) =>
      [item.name, item.commercialName, item.description ?? "", item.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }

  async getApp(id: string): Promise<AppRecord | null> {
    if (supabaseRuntime.serviceClient) {
      const { data } = await supabaseRuntime.serviceClient.from("apps").select("*").eq("id", id).maybeSingle();
      return data ? mapApp(data as Record<string, unknown>) : null;
    }
    return this.apps.get(id) ?? null;
  }

  async createApp(input: Omit<AppRecord, "id" | "createdAt" | "updatedAt">): Promise<AppRecord> {
    if (supabaseRuntime.serviceClient) {
      const { data, error } = await supabaseRuntime.serviceClient
        .from("apps")
        .insert({
          name: input.name,
          commercial_name: input.commercialName,
          description: input.description ?? null,
          status: input.status,
          tags: input.tags,
          owner: input.owner ?? null
        })
        .select("*")
        .single();

      if (error || !data) throw new Error(error?.message ?? "Falha ao criar app");
      return mapApp(data as Record<string, unknown>);
    }

    const now = new Date().toISOString();
    const item: AppRecord = { id: createId("app"), createdAt: now, updatedAt: now, ...input };
    this.apps.set(item.id, item);
    return item;
  }

  async updateApp(id: string, patch: Partial<Omit<AppRecord, "id" | "createdAt">>): Promise<AppRecord | null> {
    if (supabaseRuntime.serviceClient) {
      const { data } = await supabaseRuntime.serviceClient
        .from("apps")
        .update({
          name: patch.name,
          commercial_name: patch.commercialName,
          description: patch.description,
          status: patch.status,
          tags: patch.tags,
          owner: patch.owner,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select("*")
        .maybeSingle();
      return data ? mapApp(data as Record<string, unknown>) : null;
    }

    const current = this.apps.get(id);
    if (!current) return null;
    const updated: AppRecord = { ...current, ...patch, updatedAt: new Date().toISOString() };
    this.apps.set(id, updated);
    return updated;
  }

  async deleteApp(id: string): Promise<boolean> {
    if (supabaseRuntime.serviceClient) {
      const { error } = await supabaseRuntime.serviceClient.from("apps").delete().eq("id", id);
      return !error;
    }

    const ok = this.apps.delete(id);
    for (const [hid, hosting] of this.hostings.entries()) {
      if (hosting.appId === id) this.hostings.delete(hid);
    }
    for (const [did, domain] of this.domains.entries()) {
      if (domain.appId === id) this.domains.delete(did);
    }
    for (const [iid, integration] of this.integrations.entries()) {
      if (integration.appId === id) this.integrations.delete(iid);
    }
    return ok;
  }

  async listHostings(appId?: string): Promise<HostingRecord[]> {
    if (supabaseRuntime.serviceClient) {
      let query = supabaseRuntime.serviceClient.from("hosting_entries").select("*").order("created_at", { ascending: false });
      if (appId) query = query.eq("app_id", appId);
      const { data } = await query;
      return (data ?? []).map((row) => mapHosting(row as Record<string, unknown>));
    }

    const items = [...this.hostings.values()];
    return appId ? items.filter((item) => item.appId === appId) : items;
  }

  async createHosting(input: Omit<HostingRecord, "id" | "createdAt" | "updatedAt">): Promise<HostingRecord> {
    if (supabaseRuntime.serviceClient) {
      const { data, error } = await supabaseRuntime.serviceClient
        .from("hosting_entries")
        .insert({
          app_id: input.appId,
          provider: input.provider,
          ip: input.ip,
          type: input.type,
          region: input.region ?? null,
          notes: input.notes ?? null
        })
        .select("*")
        .single();
      if (error || !data) throw new Error(error?.message ?? "Falha ao criar hospedagem");
      return mapHosting(data as Record<string, unknown>);
    }

    const now = new Date().toISOString();
    const item: HostingRecord = { id: createId("host"), createdAt: now, updatedAt: now, ...input };
    this.hostings.set(item.id, item);
    return item;
  }

  async updateHosting(id: string, patch: Partial<Omit<HostingRecord, "id" | "createdAt">>): Promise<HostingRecord | null> {
    if (supabaseRuntime.serviceClient) {
      const { data } = await supabaseRuntime.serviceClient
        .from("hosting_entries")
        .update({
          app_id: patch.appId,
          provider: patch.provider,
          ip: patch.ip,
          type: patch.type,
          region: patch.region,
          notes: patch.notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select("*")
        .maybeSingle();
      return data ? mapHosting(data as Record<string, unknown>) : null;
    }

    const current = this.hostings.get(id);
    if (!current) return null;
    const updated: HostingRecord = { ...current, ...patch, updatedAt: new Date().toISOString() };
    this.hostings.set(id, updated);
    return updated;
  }

  async deleteHosting(id: string): Promise<boolean> {
    if (supabaseRuntime.serviceClient) {
      const { error } = await supabaseRuntime.serviceClient.from("hosting_entries").delete().eq("id", id);
      return !error;
    }
    return this.hostings.delete(id);
  }

  async listDomains(appId?: string): Promise<DomainRecord[]> {
    if (supabaseRuntime.serviceClient) {
      let query = supabaseRuntime.serviceClient.from("domains").select("*").order("created_at", { ascending: false });
      if (appId) query = query.eq("app_id", appId);
      const { data } = await query;
      return (data ?? []).map((row) => mapDomain(row as Record<string, unknown>));
    }

    const items = [...this.domains.values()];
    return appId ? items.filter((item) => item.appId === appId) : items;
  }

  async createDomain(input: Omit<DomainRecord, "id" | "createdAt" | "updatedAt">): Promise<DomainRecord> {
    if (supabaseRuntime.serviceClient) {
      const { data, error } = await supabaseRuntime.serviceClient
        .from("domains")
        .insert({
          app_id: input.appId,
          domain: input.domain,
          registrar: input.registrar,
          status: input.status,
          expires_at: input.expiresAt ?? null
        })
        .select("*")
        .single();
      if (error || !data) throw new Error(error?.message ?? "Falha ao criar dominio");
      return mapDomain(data as Record<string, unknown>);
    }

    const now = new Date().toISOString();
    const item: DomainRecord = { id: createId("dom"), createdAt: now, updatedAt: now, ...input };
    this.domains.set(item.id, item);
    return item;
  }

  async updateDomain(id: string, patch: Partial<Omit<DomainRecord, "id" | "createdAt">>): Promise<DomainRecord | null> {
    if (supabaseRuntime.serviceClient) {
      const { data } = await supabaseRuntime.serviceClient
        .from("domains")
        .update({
          app_id: patch.appId,
          domain: patch.domain,
          registrar: patch.registrar,
          status: patch.status,
          expires_at: patch.expiresAt,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select("*")
        .maybeSingle();
      return data ? mapDomain(data as Record<string, unknown>) : null;
    }

    const current = this.domains.get(id);
    if (!current) return null;
    const updated: DomainRecord = { ...current, ...patch, updatedAt: new Date().toISOString() };
    this.domains.set(id, updated);
    return updated;
  }

  async deleteDomain(id: string): Promise<boolean> {
    if (supabaseRuntime.serviceClient) {
      const { error } = await supabaseRuntime.serviceClient.from("domains").delete().eq("id", id);
      return !error;
    }
    return this.domains.delete(id);
  }

  async listIntegrations(appId?: string): Promise<AiIntegrationRecord[]> {
    if (supabaseRuntime.serviceClient) {
      let query = supabaseRuntime.serviceClient.from("ai_integrations").select("*").order("created_at", { ascending: false });
      if (appId) query = query.eq("app_id", appId);
      const { data } = await query;
      return (data ?? []).map((row) => mapIntegration(row as Record<string, unknown>));
    }

    const items = [...this.integrations.values()];
    return appId ? items.filter((item) => item.appId === appId) : items;
  }

  async createIntegration(input: Omit<AiIntegrationRecord, "id" | "createdAt" | "updatedAt">): Promise<AiIntegrationRecord> {
    if (supabaseRuntime.serviceClient) {
      const { data, error } = await supabaseRuntime.serviceClient
        .from("ai_integrations")
        .insert({
          app_id: input.appId,
          provider: input.provider,
          integration_name: input.integrationName,
          scope: input.scope ?? null,
          secret_ref_id: input.secretRefId ?? null
        })
        .select("*")
        .single();
      if (error || !data) throw new Error(error?.message ?? "Falha ao criar integracao");
      return mapIntegration(data as Record<string, unknown>);
    }

    const now = new Date().toISOString();
    const item: AiIntegrationRecord = { id: createId("int"), createdAt: now, updatedAt: now, ...input };
    this.integrations.set(item.id, item);
    return item;
  }

  async updateIntegration(
    id: string,
    patch: Partial<Omit<AiIntegrationRecord, "id" | "createdAt">>
  ): Promise<AiIntegrationRecord | null> {
    if (supabaseRuntime.serviceClient) {
      const { data } = await supabaseRuntime.serviceClient
        .from("ai_integrations")
        .update({
          app_id: patch.appId,
          provider: patch.provider,
          integration_name: patch.integrationName,
          scope: patch.scope,
          secret_ref_id: patch.secretRefId,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select("*")
        .maybeSingle();
      return data ? mapIntegration(data as Record<string, unknown>) : null;
    }

    const current = this.integrations.get(id);
    if (!current) return null;
    const updated: AiIntegrationRecord = { ...current, ...patch, updatedAt: new Date().toISOString() };
    this.integrations.set(id, updated);
    return updated;
  }

  async deleteIntegration(id: string): Promise<boolean> {
    if (supabaseRuntime.serviceClient) {
      const { error } = await supabaseRuntime.serviceClient.from("ai_integrations").delete().eq("id", id);
      return !error;
    }
    return this.integrations.delete(id);
  }
}

export const inventoryStore = new InventoryStore();

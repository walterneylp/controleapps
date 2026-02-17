import { createId } from "../../shared/id.js";
import type { AiIntegrationRecord, AppRecord, DomainRecord, HostingRecord } from "./inventory.types.js";

class InventoryStore {
  private apps = new Map<string, AppRecord>();
  private hostings = new Map<string, HostingRecord>();
  private domains = new Map<string, DomainRecord>();
  private integrations = new Map<string, AiIntegrationRecord>();

  listApps(search?: string): AppRecord[] {
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

  getApp(id: string): AppRecord | null {
    return this.apps.get(id) ?? null;
  }

  createApp(input: Omit<AppRecord, "id" | "createdAt" | "updatedAt">): AppRecord {
    const now = new Date().toISOString();
    const item: AppRecord = { id: createId("app"), createdAt: now, updatedAt: now, ...input };
    this.apps.set(item.id, item);
    return item;
  }

  updateApp(id: string, patch: Partial<Omit<AppRecord, "id" | "createdAt">>): AppRecord | null {
    const current = this.apps.get(id);
    if (!current) return null;
    const updated: AppRecord = { ...current, ...patch, updatedAt: new Date().toISOString() };
    this.apps.set(id, updated);
    return updated;
  }

  deleteApp(id: string): boolean {
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

  listHostings(appId?: string): HostingRecord[] {
    const items = [...this.hostings.values()];
    return appId ? items.filter((item) => item.appId === appId) : items;
  }

  createHosting(input: Omit<HostingRecord, "id" | "createdAt" | "updatedAt">): HostingRecord {
    const now = new Date().toISOString();
    const item: HostingRecord = { id: createId("host"), createdAt: now, updatedAt: now, ...input };
    this.hostings.set(item.id, item);
    return item;
  }

  updateHosting(id: string, patch: Partial<Omit<HostingRecord, "id" | "createdAt">>): HostingRecord | null {
    const current = this.hostings.get(id);
    if (!current) return null;
    const updated: HostingRecord = { ...current, ...patch, updatedAt: new Date().toISOString() };
    this.hostings.set(id, updated);
    return updated;
  }

  deleteHosting(id: string): boolean {
    return this.hostings.delete(id);
  }

  listDomains(appId?: string): DomainRecord[] {
    const items = [...this.domains.values()];
    return appId ? items.filter((item) => item.appId === appId) : items;
  }

  createDomain(input: Omit<DomainRecord, "id" | "createdAt" | "updatedAt">): DomainRecord {
    const now = new Date().toISOString();
    const item: DomainRecord = { id: createId("dom"), createdAt: now, updatedAt: now, ...input };
    this.domains.set(item.id, item);
    return item;
  }

  updateDomain(id: string, patch: Partial<Omit<DomainRecord, "id" | "createdAt">>): DomainRecord | null {
    const current = this.domains.get(id);
    if (!current) return null;
    const updated: DomainRecord = { ...current, ...patch, updatedAt: new Date().toISOString() };
    this.domains.set(id, updated);
    return updated;
  }

  deleteDomain(id: string): boolean {
    return this.domains.delete(id);
  }

  listIntegrations(appId?: string): AiIntegrationRecord[] {
    const items = [...this.integrations.values()];
    return appId ? items.filter((item) => item.appId === appId) : items;
  }

  createIntegration(input: Omit<AiIntegrationRecord, "id" | "createdAt" | "updatedAt">): AiIntegrationRecord {
    const now = new Date().toISOString();
    const item: AiIntegrationRecord = { id: createId("int"), createdAt: now, updatedAt: now, ...input };
    this.integrations.set(item.id, item);
    return item;
  }

  updateIntegration(
    id: string,
    patch: Partial<Omit<AiIntegrationRecord, "id" | "createdAt">>
  ): AiIntegrationRecord | null {
    const current = this.integrations.get(id);
    if (!current) return null;
    const updated: AiIntegrationRecord = { ...current, ...patch, updatedAt: new Date().toISOString() };
    this.integrations.set(id, updated);
    return updated;
  }

  deleteIntegration(id: string): boolean {
    return this.integrations.delete(id);
  }
}

export const inventoryStore = new InventoryStore();

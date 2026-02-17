import { createId } from "../../shared/id.js";

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

class SubscriptionsStore {
  private items = new Map<string, SubscriptionRecord>();

  list(appId?: string): SubscriptionRecord[] {
    const all = [...this.items.values()];
    return appId ? all.filter((i) => i.appId === appId) : all;
  }

  create(input: Omit<SubscriptionRecord, "id" | "createdAt" | "updatedAt">): SubscriptionRecord {
    const now = new Date().toISOString();
    const item: SubscriptionRecord = { id: createId("sub"), createdAt: now, updatedAt: now, ...input };
    this.items.set(item.id, item);
    return item;
  }

  update(id: string, patch: Partial<Omit<SubscriptionRecord, "id" | "createdAt">>): SubscriptionRecord | null {
    const current = this.items.get(id);
    if (!current) return null;
    const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}

export const subscriptionsStore = new SubscriptionsStore();

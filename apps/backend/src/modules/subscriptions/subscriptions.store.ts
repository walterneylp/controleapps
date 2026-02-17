import { createId } from "../../shared/id.js";
import { supabaseRuntime } from "../../integrations/supabase.js";

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

function mapSub(row: Record<string, unknown>): SubscriptionRecord {
  return {
    id: String(row.id),
    appId: String(row.app_id),
    provider: String(row.provider),
    cardHolderName: String(row.card_holder_name),
    cardLast4: String(row.card_last4),
    recurrence: (row.recurrence as "mensal" | "anual") ?? "mensal",
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

class SubscriptionsStore {
  private items = new Map<string, SubscriptionRecord>();

  async list(appId?: string): Promise<SubscriptionRecord[]> {
    if (supabaseRuntime.serviceClient) {
      let query = supabaseRuntime.serviceClient.from("subscriptions").select("*").order("created_at", { ascending: false });
      if (appId) query = query.eq("app_id", appId);
      const { data } = await query;
      return (data ?? []).map((row) => mapSub(row as Record<string, unknown>));
    }

    const all = [...this.items.values()];
    return appId ? all.filter((i) => i.appId === appId) : all;
  }

  async create(input: Omit<SubscriptionRecord, "id" | "createdAt" | "updatedAt">): Promise<SubscriptionRecord> {
    if (supabaseRuntime.serviceClient) {
      const { data, error } = await supabaseRuntime.serviceClient
        .from("subscriptions")
        .insert({
          app_id: input.appId,
          provider: input.provider,
          card_holder_name: input.cardHolderName,
          card_last4: input.cardLast4,
          recurrence: input.recurrence
        })
        .select("*")
        .single();
      if (error || !data) throw new Error(error?.message ?? "Falha ao criar assinatura");
      return mapSub(data as Record<string, unknown>);
    }

    const now = new Date().toISOString();
    const item: SubscriptionRecord = { id: createId("sub"), createdAt: now, updatedAt: now, ...input };
    this.items.set(item.id, item);
    return item;
  }

  async update(id: string, patch: Partial<Omit<SubscriptionRecord, "id" | "createdAt">>): Promise<SubscriptionRecord | null> {
    if (supabaseRuntime.serviceClient) {
      const { data } = await supabaseRuntime.serviceClient
        .from("subscriptions")
        .update({
          app_id: patch.appId,
          provider: patch.provider,
          card_holder_name: patch.cardHolderName,
          card_last4: patch.cardLast4,
          recurrence: patch.recurrence,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select("*")
        .maybeSingle();
      return data ? mapSub(data as Record<string, unknown>) : null;
    }

    const current = this.items.get(id);
    if (!current) return null;
    const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (supabaseRuntime.serviceClient) {
      const { error } = await supabaseRuntime.serviceClient.from("subscriptions").delete().eq("id", id);
      return !error;
    }
    return this.items.delete(id);
  }
}

export const subscriptionsStore = new SubscriptionsStore();

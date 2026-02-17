import { supabaseRuntime } from "../../integrations/supabase.js";

type AuditAction =
  | "login_success"
  | "login_failed"
  | "access_denied"
  | "view_secret"
  | "create"
  | "update"
  | "delete";

interface AuditEvent {
  actorId?: string;
  actorEmail?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

const inMemoryAuditLog: AuditEvent[] = [];

export class AuditService {
  async record(event: Omit<AuditEvent, "timestamp">): Promise<AuditEvent> {
    const payload: AuditEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    inMemoryAuditLog.push(payload);

    if (supabaseRuntime.serviceClient) {
      try {
        await supabaseRuntime.serviceClient.from("audit_events").insert({
          actor_id: payload.actorId ?? null,
          actor_email: payload.actorEmail ?? null,
          action: payload.action,
          resource: payload.resource,
          resource_id: payload.resourceId ?? null,
          context: payload.context ?? null,
          created_at: payload.timestamp
        });
      } catch {
        // Keep request path alive if audit persistence fails.
      }
    }

    return payload;
  }

  async list(): Promise<AuditEvent[]> {
    if (supabaseRuntime.serviceClient) {
      try {
        const { data } = await supabaseRuntime.serviceClient
          .from("audit_events")
          .select("actor_id, actor_email, action, resource, resource_id, context, created_at")
          .order("created_at", { ascending: false })
          .limit(200);

        if (data) {
          return data.map((item) => ({
            actorId: item.actor_id ?? undefined,
            actorEmail: item.actor_email ?? undefined,
            action: item.action as AuditAction,
            resource: item.resource,
            resourceId: item.resource_id ?? undefined,
            context: (item.context as Record<string, unknown> | null) ?? undefined,
            timestamp: item.created_at
          }));
        }
      } catch {
        // Fall back to in-memory history.
      }
    }

    return [...inMemoryAuditLog].reverse();
  }
}

export const auditService = new AuditService();

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
  record(event: Omit<AuditEvent, "timestamp">): AuditEvent {
    const payload: AuditEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    inMemoryAuditLog.push(payload);
    return payload;
  }

  list(): AuditEvent[] {
    return [...inMemoryAuditLog].reverse();
  }
}

export const auditService = new AuditService();

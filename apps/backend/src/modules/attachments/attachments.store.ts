import { createId } from "../../shared/id.js";

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

class AttachmentsStore {
  private items = new Map<string, AttachmentRecord>();

  list(appId?: string): AttachmentRecord[] {
    const all = [...this.items.values()];
    return appId ? all.filter((x) => x.appId === appId) : all;
  }

  create(input: Omit<AttachmentRecord, "id" | "createdAt">): AttachmentRecord {
    const item: AttachmentRecord = {
      id: createId("att"),
      createdAt: new Date().toISOString(),
      ...input
    };
    this.items.set(item.id, item);
    return item;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}

export const attachmentsStore = new AttachmentsStore();

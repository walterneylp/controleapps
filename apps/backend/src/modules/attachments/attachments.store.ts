import { createId } from "../../shared/id.js";
import { supabaseRuntime } from "../../integrations/supabase.js";

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

function mapAttachment(row: Record<string, unknown>): AttachmentRecord {
  return {
    id: String(row.id),
    appId: String(row.app_id),
    fileName: String(row.file_name),
    mimeType: String(row.mime_type),
    sizeBytes: Number(row.size_bytes),
    storagePath: String(row.storage_path),
    uploadedBy: (row.uploaded_by as string | null) ?? undefined,
    createdAt: String(row.created_at)
  };
}

class AttachmentsStore {
  private items = new Map<string, AttachmentRecord>();

  async list(appId?: string): Promise<AttachmentRecord[]> {
    if (supabaseRuntime.serviceClient) {
      let query = supabaseRuntime.serviceClient.from("attachments").select("*").order("created_at", { ascending: false });
      if (appId) query = query.eq("app_id", appId);
      const { data } = await query;
      return (data ?? []).map((row) => mapAttachment(row as Record<string, unknown>));
    }

    const all = [...this.items.values()];
    return appId ? all.filter((x) => x.appId === appId) : all;
  }

  async create(
    input: Omit<AttachmentRecord, "id" | "createdAt"> & { fileContentBase64?: string }
  ): Promise<AttachmentRecord> {
    if (supabaseRuntime.serviceClient) {
      if (input.fileContentBase64) {
        const binary = Buffer.from(input.fileContentBase64, "base64");
        await supabaseRuntime.serviceClient.storage
          .from(supabaseRuntime.bucketName)
          .upload(input.storagePath, binary, { upsert: true, contentType: input.mimeType });
      }

      const { data, error } = await supabaseRuntime.serviceClient
        .from("attachments")
        .insert({
          app_id: input.appId,
          file_name: input.fileName,
          mime_type: input.mimeType,
          size_bytes: input.sizeBytes,
          storage_path: input.storagePath,
          uploaded_by: input.uploadedBy ?? null
        })
        .select("*")
        .single();

      if (error || !data) throw new Error(error?.message ?? "Falha ao criar anexo");
      return mapAttachment(data as Record<string, unknown>);
    }

    const item: AttachmentRecord = {
      id: createId("att"),
      createdAt: new Date().toISOString(),
      appId: input.appId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storagePath: input.storagePath,
      uploadedBy: input.uploadedBy
    };
    this.items.set(item.id, item);
    return item;
  }

  async delete(id: string): Promise<boolean> {
    if (supabaseRuntime.serviceClient) {
      const { data } = await supabaseRuntime.serviceClient.from("attachments").select("storage_path").eq("id", id).maybeSingle();
      if (data?.storage_path) {
        await supabaseRuntime.serviceClient.storage.from(supabaseRuntime.bucketName).remove([String(data.storage_path)]);
      }
      const { error } = await supabaseRuntime.serviceClient.from("attachments").delete().eq("id", id);
      return !error;
    }

    return this.items.delete(id);
  }
}

export const attachmentsStore = new AttachmentsStore();

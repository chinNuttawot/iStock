// src/service/apiCore/uploadService.ts
import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import uploadApi from "../apiCore/uploadApi";

export type UploadMultiResult = {
  ok: boolean;
  count: number;
  keyRef1?: string;
  files?: {
    originalName: string;
    savedAs: string;
    size: number;
    mime: string;
  }[];
  [k: string]: any;
};

export type UploadFilePart = {
  uri: string; // RN/Expo: file:// หรือ content://
  name: string;
  type: string; // เช่น "image/jpeg", "application/pdf"
};

const DEFAULT_BASE_URL = "http://istockapp.myvnc.com/"; // ให้ตรง prod โดยดีฟอลต์

function toStr(v: unknown): string {
  return typeof v === "string" ? v : String(v);
}

type UploadOpts = {
  baseUrl?: string; // override ได้ต่อคำขอ
  timeoutMs?: number; // ดีฟอลต์ 180s
  signal?: AbortSignal; // ยกเลิกจากภายนอก
  onProgress?: (pct: number) => void; // อัปเดต % ขณะอัปโหลด
};

export async function uploadMultiFetch(
  files: UploadFilePart[],
  keyRef1: string,
  keyRef2: unknown = null,
  keyRef3: unknown = null,
  remark: unknown = null,
  opts?: UploadOpts
): Promise<UploadMultiResult> {
  // ---- FormData ----
  const form = new FormData();
  for (const f of files) {
    // อย่าเซ็ต Content-Type เอง ปล่อย axios จัดการ boundary ให้
    form.append("files", { uri: f.uri, name: f.name, type: f.type } as any);
  }
  form.append("keyRef1", toStr(keyRef1));
  if (keyRef2 != null) form.append("keyRef2", toStr(keyRef2));
  if (keyRef3 != null) form.append("keyRef3", toStr(keyRef3));
  if (remark != null) form.append("remark", toStr(remark));

  // ---- Token ----
  let token: string | null = null;
  try {
    token = await StorageUtility.get(authToken);
  } catch {
    // noop
  }

  // ---- Abort/Timeout ----
  const innerController = new AbortController();
  const timeoutMs = opts?.timeoutMs ?? 180_000;
  const timeoutId = setTimeout(() => innerController.abort(), timeoutMs);
  const signal = opts?.signal ?? innerController.signal;

  // ---- Base URL ----
  const baseURL = opts?.baseUrl ?? DEFAULT_BASE_URL;

  try {
    const res = await uploadApi.post<UploadMultiResult>(
      "api/upload/multi",
      form,
      {
        baseURL,
        signal,
        timeout: timeoutMs, // override ต่อคำขอ
        maxContentLength: Infinity as any,
        maxBodyLength: Infinity as any,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // ⚠️ ห้ามกำหนด 'Content-Type': 'multipart/form-data' เอง
        },
        onUploadProgress: (e: any) => {
          if (opts?.onProgress && e.total) {
            const pct = Math.round((e.loaded / e.total) * 100);
            opts.onProgress(pct);
          }
        },
      }
    );

    // axios จะ parse JSON ให้อยู่แล้วเมื่อ Content-Type เป็น application/json
    return res.data ?? ({ ok: true, count: files.length } as UploadMultiResult);
  } catch (err: any) {
    if (err?.response) {
      console.log("response error:", {
        status: err.response.status,
        data: err.response.data,
      });
    } else if (err?.request) {
      console.log("no response from server:", {
        url: err.config?.baseURL + err.config?.url,
        method: err.config?.method,
        timeout: err.config?.timeout,
      });
    } else {
      console.log("setup error:", err?.message);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

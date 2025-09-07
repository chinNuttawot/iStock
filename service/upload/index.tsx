// src/service/apiCore/uploadService.ts
import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import { DEFAULT_BASE_URL } from "../apiCore";

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
  uri: string;
  name: string;
  type: string;
};

function toStr(v: unknown): string {
  return typeof v === "string" ? v : String(v);
}

type UploadOpts = {
  baseUrl?: string;
  timeoutMs?: number; // client timeout (ดีฟอลต์ 5 นาที)
  signal?: AbortSignal; // ยกเลิกจากภายนอก
  onProgress?: (pct: number) => void;
};

/** รวมหลาย AbortSignal: ไหน abort → ยกเลิกทั้งหมด */
function anySignal(
  signals: (AbortSignal | undefined)[]
): AbortController | null {
  const active = signals.filter(Boolean) as AbortSignal[];
  if (active.length === 0) return null;
  const c = new AbortController();
  const onAbort = () => c.abort();
  active.forEach((s) => {
    if (s.aborted) c.abort();
    else s.addEventListener("abort", onAbort, { once: true });
  });
  c.signal.addEventListener("abort", () => {
    active.forEach((s) => s.removeEventListener("abort", onAbort as any));
  });
  return c;
}

export async function uploadMultiFetch(
  files: UploadFilePart[],
  keyRef1: string,
  keyRef2: unknown = null,
  keyRef3: unknown = null,
  remark: unknown = null,
  createdBy: unknown = null,
  opts?: UploadOpts
): Promise<UploadMultiResult> {
  // ---- FormData ----
  const form = new FormData();
  for (const f of files) {
    form.append("files", { uri: f.uri, name: f.name, type: f.type } as any);
  }
  form.append("keyRef1", toStr(keyRef1));
  if (keyRef2 != null) form.append("keyRef2", toStr(keyRef2));
  if (keyRef3 != null) form.append("keyRef3", toStr(keyRef3));
  if (remark != null) form.append("remark", toStr(remark));
  if (createdBy != null) form.append("createdBy", toStr(createdBy));

  // ---- Token ----
  let token: string | null = null;
  try {
    token = await StorageUtility.get(authToken);
  } catch {
    // noop
  }

  // ---- Base URL ----
  const baseURL = opts?.baseUrl ?? DEFAULT_BASE_URL;

  // ---- Timeout/Abort ----
  const DEFAULT_TIMEOUT = 5 * 60 * 1000;
  const timeoutMs = Math.max(10_000, opts?.timeoutMs ?? DEFAULT_TIMEOUT);

  // internal timeout
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  // รวมสัญญาณจากภายนอก + internal
  const combined = (() => {
    const c = new AbortController();
    const subs: [AbortSignal, () => void][] = [];
    const join = (sig: AbortSignal) => {
      const onAbort = () => c.abort();
      if (sig.aborted) c.abort();
      else sig.addEventListener("abort", onAbort, { once: true });
      subs.push([sig, onAbort]);
    };
    join(timeoutController.signal);
    if (opts?.signal) join(opts.signal);
    c.signal.addEventListener("abort", () => {
      subs.forEach(([s, fn]) => s.removeEventListener("abort", fn));
    });
    return c;
  })();

  try {
    const res = await fetch(`${baseURL}api/upload/multi`, {
      method: "POST",
      body: form,
      // ❗️ห้ามกำหนด Content-Type เอง ให้ RN ใส่ multipart/form-data + boundary อัตโนมัติ
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: "application/json",
      } as any,
      signal: combined.signal,
      // withCredentials ไม่มีผลใน RN fetch; ถ้าบนเว็บให้จัด CORS แยก
    });

    // clear timeout ทันทีที่ได้ response
    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload failed: ${res.status} ${text}`);
    }

    // TODO: onProgress ยังทำไม่ได้ด้วย fetch บน RN
    const data = (await res.json()) as UploadMultiResult;
    return data ?? ({ ok: true, count: files.length } as UploadMultiResult);
  } catch (err: any) {
    // แยกกรณี timeout/abort เพื่อดีบักง่าย
    if (timeoutController.signal.aborted) {
      console.log("client timeout (fetch):", {
        timeoutMs,
        url: baseURL + "/api/upload/multi",
      });
    } else if (opts?.signal?.aborted) {
      console.log("request aborted by external signal");
    } else {
      console.log("upload (fetch) error:", err?.message || err);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

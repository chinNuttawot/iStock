// src/service/apiCore/uploadApi.ts
import axios from "axios";
import { DEFAULT_BASE_URL } from "..";

const uploadApi = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 5 * 60 * 1000,
  maxContentLength: Infinity as any,
  maxBodyLength: Infinity as any,
  withCredentials: false, // กัน preflight/credentials โดยไม่จำเป็น
});

// 🔴 ลงทะเบียน "ตัวลบ Content-Type" เป็นตัวแรก (จะถูกเรียก 'หลังสุด')
uploadApi.interceptors.request.use((config) => {
  const ct =
    // @ts-ignore
    config.headers?.get?.("Content-Type") ||
    // @ts-ignore
    config.headers?.["Content-Type"] ||
    // @ts-ignore
    config.headers?.["content-type"];
  console.log("[uploadApi] FINAL Content-Type before send:", ct);
  console.log("[uploadApi] Data is:", config.data?.constructor?.name);
  return config;
});

export default uploadApi;

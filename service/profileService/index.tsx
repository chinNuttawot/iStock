// src/service/apiCore/profileService.ts
import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import api from "../apiCore";

export const PROFILE_KEY = "profile:data";

export type ProfileApi = {
  ["@odata.etag"]?: string;
  User_Security_ID: string;
  userName: string;
  fullName: string;
  branchCode: string;
  isApprover: boolean;
};

export type ProfileResponse = {
  success: boolean;
  message: string;
  data: ProfileApi;
};

// ✅ Profile() ใช้ตรงๆ ได้เลย
export const Profile = async (): Promise<ProfileApi> => {
  try {
    const token = await StorageUtility.get(authToken);

    const res = await api.get<ProfileResponse>("api/Profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const profile = res.data?.data;

    if (profile) {
      // เก็บลง Storage อัตโนมัติ
      await StorageUtility.set(PROFILE_KEY, JSON.stringify(profile));
    }

    return profile;
  } catch (error: any) {
    if (error.response) {
      alert(error.response.data.message);
    }
    throw error;
  }
};

// ✅ ดึงจาก cache
export const getProfile = async (): Promise<ProfileApi | null> => {
  const str = await StorageUtility.get(PROFILE_KEY);
  if (!str) return null;
  try {
    return JSON.parse(str) as ProfileApi;
  } catch {
    return null;
  }
};

export const delProfile = async () => {
  await StorageUtility.remove(PROFILE_KEY);
};
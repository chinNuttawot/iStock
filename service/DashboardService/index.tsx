import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import api from "../apiCore";
import { getProfile } from "../profileService";

export const DashboardService = async () => {
  try {
    const token = await StorageUtility.get(authToken);
    const profile = await getProfile();
    const params = { branchCode: profile?.branchCode } as any;
    if (!profile?.isApprover) params["user"] = profile?.userName;
    const response = await api.get(`api/Dashboard`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      alert(error.response.data.message);
    }
    throw error;
  }
};

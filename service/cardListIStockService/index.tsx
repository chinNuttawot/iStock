import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import api from "../apiCore";
import { getProfile } from "../profileService";

export const cardListIStockService = async (params: any) => {
  try {
    const token = await StorageUtility.get(authToken);
    const profile = await getProfile();
    const response = await api.get(`api/documents`, {
      params: {
        ...params,
        createdBy: profile?.userName,
        isApprover: profile?.isApprover,
      },
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

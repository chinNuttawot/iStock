import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import api from "../apiCore";
import { cleanParams } from "../cardListIStockService";
import { getProfile } from "../profileService";

export const transactionHistoryService = async (params: any) => {
  try {
    const token = await StorageUtility.get(authToken);
    const profile = await getProfile();
    params = cleanParams(params);
    const response = await api.get(`api/GetTransactionHistory`, {
      params: {
        ...params,
        createdBy: profile?.userName,
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

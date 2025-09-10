import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import api from "../apiCore";

export const saveDocumentsNAVService = async (data: any) => {
  try {
    const token = await StorageUtility.get(authToken);
    const response = await api.post(`api/saveDocuments-NAV`, data, {
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

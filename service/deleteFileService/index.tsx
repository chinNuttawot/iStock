import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import api from "../apiCore";

export const deleteFileService = async (parmas = {} as any) => {
  try {
    const token = await StorageUtility.get(authToken);
    const response = await api.delete(`api/files/${parmas.name}`, {
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

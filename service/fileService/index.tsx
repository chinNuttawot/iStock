import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import api from "../apiCore";

interface paramsModel {
  keyRef1: string;
  keyRef2?: any;
  keyRef3?: any;
}

export const fileService = async (params: paramsModel) => {
  try {
    const token = await StorageUtility.get(authToken);
    const response = await api.get(`api/files-list`, {
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

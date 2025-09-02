import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import api from "../apiCore";

interface paramsModel {
  itemNo: string;
}

export const itemVariantWSService = async (params: paramsModel) => {
  try {
    const token = await StorageUtility.get(authToken);
    const response = await api.get(`api/ItemVariantWS`, {
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

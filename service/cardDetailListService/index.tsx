import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import api from "../apiCore";

interface paramsModel {
  menuId: number;
  docNo: string;
}

export const cardDetailListService = async (params: paramsModel) => {
  try {
    const token = await StorageUtility.get(authToken);
    const { menuId, docNo } = params;
    const response = await api.get(
      `api/CardDetailList?menuId=${menuId}&docNo=${docNo}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      alert(error.response.data.message);
    }
    throw error;
  }
};

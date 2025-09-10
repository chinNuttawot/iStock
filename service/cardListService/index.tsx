import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import api from "../apiCore";
import { cleanParams } from "../cardListIStockService";
import { getProfile } from "../profileService";

interface paramsModel {
  menuId: number;
  branchCode: string;
}

export const cardListService = async (params: paramsModel) => {
  try {
    const token = await StorageUtility.get(authToken);
    const profile = await getProfile();
    let { menuId, branchCode, ...newParma } = params;
    newParma = cleanParams(newParma);
    const response = await api.get(
      `api/CardList?menuId=${menuId}&branchCode=${branchCode}`,
      {
        params: { isApprover: profile?.isApprover, ...newParma },
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

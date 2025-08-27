import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import api from "../apiCore";

interface paramsModel {
  locationCode: string;
}

export const binCodesByLocationService = async (params: paramsModel) => {
  try {
    const token = await StorageUtility.get(authToken);
    const { locationCode } = params;
    const response = await api.get(
      `api/BinCodesByLocation?locationCode=${locationCode}`,
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

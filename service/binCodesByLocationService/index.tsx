import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import api from "../apiCore";
import { getProfile } from "../profileService";

interface paramsModel {
  locationCodeFrom: string;
}

export const binCodesByLocationService = async (params: paramsModel) => {
  try {
    const token = await StorageUtility.get(authToken);
    const profile = await getProfile();
    const { locationCodeFrom } = params;
    const response = await api.get(
      `api/BinCodesByLocation?locationCodeFrom=${locationCodeFrom}`,
      {
        params: { isApprover: profile?.isApprover },
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

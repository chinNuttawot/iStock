import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import api from "../apiCore";
import { getProfile } from "../profileService";

interface dataModel {
  docNo: string;
}

export const SendToApproveDocuments = async (data: dataModel) => {
  try {
    const token = await StorageUtility.get(authToken);
    const profile = await getProfile();
    const response = await api.post(
      "api/SendToApproveDocuments",
      { ...data, user: profile?.userName },
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

import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import api from "../apiCore";

interface dataModel {
  docNo: string;
  status: string;
}

export const ApproveDocumentsService = async (data: dataModel) => {
  try {
    const token = await StorageUtility.get(authToken);
    const response = await api.post("api/ApproveDocuments", data, {
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

import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import api from "../apiCore";

interface ForgotPasswordServiceModel {
  username: string;
  newPassword: string;
}
export const ForgotPasswordService = async (
  data: ForgotPasswordServiceModel
) => {
  try {
    const token = await StorageUtility.get(authToken);
    const response = await api.post("api/forgot-password", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

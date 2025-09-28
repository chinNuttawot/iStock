import api from "../apiCore";

interface ForgotPasswordServiceModel {
  username: string;
  newPassword: string;
}
export const ForgotPasswordService = async (
  data: ForgotPasswordServiceModel
) => {
  try {
    const response = await api.post("api/forgot-password", data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

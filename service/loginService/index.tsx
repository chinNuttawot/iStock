import api from "../apiCore";
import { paramsLoginModel } from "../myInterface";

export const loginService = async (data: paramsLoginModel) => {
  try {
    const response = await api.post("api/Login", data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      alert(error.response.data.message);
    }
    throw error;
  }
};

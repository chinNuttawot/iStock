import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import api from "../apiCore";
import { getProfile } from "../profileService";

export function cleanParams(obj: any) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k, v]) => {
      if (v === "" || v === null || v === undefined) return false;
      if (v === "All") return false; // กรณีไม่อยากส่งค่า All
      return true;
    })
  );
}

export const cardListIStockService = async (params: any) => {
  try {
    const token = await StorageUtility.get(authToken);
    const profile = await getProfile();
    params = cleanParams(params);
    if (profile?.isApprover) {
      params = {
        ...params,
        status: "Pending Approval",
      };
    }
    const response = await api.get(`api/documents`, {
      params: {
        ...params,
        createdBy: profile?.userName,
        isApprover: profile?.isApprover,
        branchCode: profile?.branchCode,
      },
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

export const cardListIStockBydocNoService = async (params: any) => {
  try {
    const token = await StorageUtility.get(authToken);
    const response = await api.get(`api/documents/${params.docNo}`, {
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

export const cardListIStockBydocNoForTransactionHistoryService = async (
  params: any
) => {
  try {
    const token = await StorageUtility.get(authToken);
    const response = await api.get(
      `api/documents-for-transaction-history/${params.docNo}`,
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

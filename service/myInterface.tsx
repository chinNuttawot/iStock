export interface paramsLoginModel {
  username: string;
  password: string;
}
export interface resModel<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface menuModel {
  success: boolean;
  message: string;
  data: Daum[];
}

export interface Daum {
  menuId: number;
  Label: string;
  IconType: string;
  IconName: string;
  ImagePath: string;
  isActive: boolean;
  nameMenu?: string;
}

// "@/service/myInterface.ts"
export interface ProfileApiModel {
  ["@odata.etag"]?: string; // เข้าถึงแบบ obj["@odata.etag"]
  User_Security_ID?: string;
  userName?: string;
  fullName?: string;
  branchCode?: string;
  branchCodeFilter?: string;
  isApprover?: boolean;
}

export interface Profile {
  odataEtag?: string;
  userSecurityId: string;
  userName: string;
  fullName: string;
  branchCode: string;
  branchCodeFilter: string;
  isApprover: boolean;
}

export interface ResModel<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface CardListModel {
  id: string;
  menuId: number;
  docNo: string;
  menuType: string;
  status: string;
  date: string;
  details: CardListDetail[];
}

export interface CardListDetail {
  label: string;
  value: string;
}

export type RouteParams = { menuId: number };

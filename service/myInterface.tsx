export interface paramsLoginModel {
  username: string;
  password: string;
}
export interface resModel<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
}

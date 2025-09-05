import axios from "axios";

const API_BASE_URL = "http://istockapp.myvnc.com/";
export const DEFAULT_BASE_URL = "http://istockapp.myvnc.com/";
// const API_BASE_URL = "http://localhost:3001/";
// export const DEFAULT_BASE_URL = "http://localhost:3001/";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export default api;

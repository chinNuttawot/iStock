import axios from "axios";

// const API_BASE_URL = "https://istockapp.myvnc.com:8443/";
// export const DEFAULT_BASE_URL = "https://istockapp.myvnc.com:8443/";
const API_BASE_URL = "http://10.0.2.2:3001/";
export const DEFAULT_BASE_URL = "http://10.0.2.2:3001/";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export default api;

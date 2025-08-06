import axios from "axios";

const API_BASE_URL = "http://istockapp.myvnc.com/"; 

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export default api;

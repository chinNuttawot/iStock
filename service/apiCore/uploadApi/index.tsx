// src/service/apiCore/uploadApi.ts
import axios from "axios";

const uploadApi = axios.create({
  baseURL: "http://istockapp.myvnc.com/",
  timeout: 180_000,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

export default uploadApi;

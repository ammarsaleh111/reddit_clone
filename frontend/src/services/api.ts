
import axios from "axios";

const api = axios.create({
  baseURL: "/api",

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,

  timeout: 10000,
});

export default api;

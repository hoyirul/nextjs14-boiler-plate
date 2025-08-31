/* 
  Author  : Mochammad Hairullah
  Path    : /app/lib/axios.ts
*/

import { HTTP_STATUS } from "@/app/constants/http-status";
import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";

// 🔹 Create API instance per version
function createApiInstance(version: string = "v1"): AxiosInstance {
  const instance = axios.create({
    baseURL: `/api/${version}`,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // 🔹 Request interceptor: attach Bearer token
  instance.interceptors.request.use(
    (config) => {
      const token = Cookies.get("token");
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 🔹 Response interceptor: handle 401
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const statusCode = [HTTP_STATUS.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN]
      if (statusCode.includes(error.response?.status)) {
        Cookies.remove("token");
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

// 🔹 Pre-created instances
export const apiV1 = createApiInstance("v1");
export const apiV2 = createApiInstance("v2");

// 🔹 Default export v1
export default apiV1;

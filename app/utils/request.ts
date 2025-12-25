import axios from "axios";

// 创建 axios 请求实例
export const serviceAxios = axios.create({
  baseURL: "/api",
});

// 创建请求拦截
serviceAxios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 创建响应拦截
serviceAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

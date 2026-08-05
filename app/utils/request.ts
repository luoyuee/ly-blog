import type { AxiosError, AxiosResponse } from "axios";
import axios from "axios";

// 创建 axios 请求实例
const request = axios.create({
  baseURL: "/api"
});

// 创建请求拦截，鉴权使用的是cookie，浏览器会自动处理，所以这里不需要添加任何内容
request.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// 创建响应拦截：剥离 response.data，调用方直接拿到业务数据；401 跳转登录，其它错误原样抛出
request.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default request;

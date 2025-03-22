// api/axiosConfig.js
import axios from 'axios';

// 创建一个带基础URL的axios实例
const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// 请求拦截器 - 添加认证头
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    if (token) {
        config.headers.Authorization = `Bearer ${token.trim()}`;
        console.log('Request headers:', config.headers);
    }
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器 - 处理认证错误
api.interceptors.response.use(
  response => response,
  error => {
    // 如果收到401响应，清除令牌并重定向到登录页面
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
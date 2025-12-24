// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://13.211.147.73:8000',
});

// 요청마다 token 자동 첨부
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('Token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (단순 에러 전달)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 여기서는 아무 처리 안 하고 그대로 넘김
    return Promise.reject(error);
  }
);

export default axiosInstance;

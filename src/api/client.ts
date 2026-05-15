import axios, { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

const api: AxiosInstance = axios.create({
  baseURL: localStorage.getItem('api_base_url') || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'sec_9f7d2b8e4a3c1f5b0d6e8a9c2b4f6e1a'
  },
});

// Response interceptor: unwrap data.data, toast on error
api.interceptors.response.use(
  (res: AxiosResponse<any>) => {
    // Unwrap the ApiResponse wrapper
    if (res.data && typeof res.data === 'object' && 'data' in res.data) {
      return res.data.data as any;
    }
    return res.data as any;
  },
  (err: any) => {
    const msg = err.response?.data?.message || err.message || 'Something went wrong';
    toast.error(msg);
    return Promise.reject(err);
  }
);

export default api;

import axios from 'axios';
import { store } from '../store/billingStore';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true
});

// Response Interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      store.logout();
    }
    return Promise.reject(error);
  }
);

export default instance;

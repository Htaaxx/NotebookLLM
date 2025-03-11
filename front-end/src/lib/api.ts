import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để gắn token xác thực vào headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Các phương thức API xác thực
export const authAPI = {
  signIn: async (username: string, password: string) => {
    const response = await api.post('/signin', { username, password });
    localStorage.setItem('authToken', response.data.token);
    return response.data;
  },
  
  signUp: async (username: string, email: string, password: string) => {
    const response = await api.post('/signup', { 
      username, 
      email,
      password 
    });
    return response.data;
  },
  
  signOut: async () => {
    const response = await api.post('/signout');
    localStorage.removeItem('authToken');
    return response.data;
  }
};

// Các phương thức API cho tài liệu
export const documentAPI = {
  createDocument: async (userId: string) => {
    const response = await api.post('/createDocument', { user_id: userId });
    return response.data;
  },
  
  getDocuments: async (userId: string) => {
    const response = await api.post('/getDocumentWithUser', { user_id: userId });
    return response.data;
  }
};

export default api;
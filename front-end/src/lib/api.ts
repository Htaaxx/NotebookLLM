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

// Thêm interceptor để xử lý 401 error và refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi là 401 (Unauthorized) và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Lấy refresh token từ localStorage
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // Không có refresh token, chuyển hướng đến trang đăng nhập
          window.location.href = '/signin';
          return Promise.reject(error);
        }

        // Gọi API refresh token
        const response = await axios.post(`${API_URL}/refresh`, { refreshToken });

        // Lưu token mới vào localStorage
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }

        // Thử lại request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh token thất bại, chuyển hướng đến trang đăng nhập
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Các phương thức API xác thực
export const authAPI = {
  signIn: async (username: string, password: string) => {
    const response = await api.post('/signin', { username, password });
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('username', response.data.username);
    localStorage.setItem('user_id', response.data.user_id);
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

  googleSignIn: async (userData: { email: string; name: string; id: string }) => {
    const response = await api.post('/auth/google', userData);
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('username', userData.name);
    return response.data;
  },

  signOut: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post('/signout', { refreshToken });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
    }
  },

  // Check xem Token co hop le khong
  checkAuth: async () => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Các phương thức API cho tài liệu
export const documentAPI = {
  createDocument: async (userId: string, documentName: string, document_path: string) => {
    const response = await api.post('/createDocument', { 
      user_id: userId, 
      document_name: documentName, 
      document_path: document_path 
    });
    return response.data;
  },

  getDocuments: async (userId: string) => {
    const response = await api.post('/getDocumentWithUser', { user_id: userId });
    return response.data;
  },

  deleteDocument: async (documentId: string) => {
    const response = await api.post('/deleteDocument', { document_id: documentId });
    return response.data;
  }
};

export default api;
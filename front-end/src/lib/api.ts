import axios from 'axios';
const API_URL = process.env.NEXT_PUBLIC_BACKEND_DB_URL;
// console.log('API_URL:', API_URL);

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
// console log api
// console.log('API instance:', api);
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
    // console log url 
    console.log('URL:', api.defaults.baseURL + '/signin');
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
    localStorage.setItem('user_id', userData.id);
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
  },

  changePassword: async (userId: string, oldPassword: string, newPassword: string) => {
    try{
      const response = await api.post('/changePassword', { 
        user_id: userId, 
        old_password: oldPassword,  
        new_password: newPassword  
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

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
  },

  updateDocument: async (documentId: string, updateData: any) => {
    const response = await api.post('/updateDocument', { 
      document_id: documentId,
      ...updateData
    });
    return response.data;
  },

  updateDocumentStatus: async (documentId: string, status: '0' | '1') => {
    const response = await api.post('/updateDocumentStatus', {
      document_id: documentId,
      status: status
    });
    return response.data;
  },

  getUserWithDocument: async (documentId: string) => {
    const response = await api.post('/getUserWithDocument', { document_id: documentId });
    return response.data.user_id; 
  },
  
};


// Các phương thức API cho accountType
export const accountTypeAPI = {
  getAccountTypes: async (user_id: string) => {
    const response = await api.post('/getAccountType', { user_id });
    return response.data;
  },

  getCountQuery: async (user_id: string) => {
    const response = await api.post('/getCountQuery', { user_id });
    return response.data;
  },

  getCountMindmap: async (user_id: string) => {
    const response = await api.post('/getCountMindmap', { user_id });
    return response.data;
  },

  getCountCheatSheet: async (user_id: string) => {
    const response = await api.post('/getCountCheatSheet', { user_id });
    return response.data;
  },

  getCountFlashcard: async (user_id: string) => {
    const response = await api.post('/getCountFlashcard', { user_id });
    return response.data;
  },

  updateCountQuery: async (user_id: string) => {
    const response = await api.post('/updateCountQuery', { user_id });
    return response.data;
  },

  updateCountMindmap: async (user_id: string) => {
    const response = await api.post('/updateCountMindmap', { user_id });
    return response.data;
  },

  updateCountCheatSheet: async (user_id: string) => {
    const response = await api.post('/updateCountCheatSheet', { user_id });
    return response.data;
  },

  updateCountFlashcard: async (user_id: string) => {
    const response = await api.post('/updateCountFlashcard', { user_id });
    return response.data;
  },

  checkAndResetCounts: async (user_id: string) => {
    const response = await api.post('/checkAndResetCounts', { user_id });
    return response.data;
  },

  updateAccountType: async (user_id: string, accountType: string) => {
    const response = await api.post('/updateAccountType', { user_id, accountType });
    return response.data;
  },

  createCountWithId : async (user_id: string) => {
    const response = await api.post('/createCountWithUserId', { user_id });
    return response.data;
  }

};


export default api;
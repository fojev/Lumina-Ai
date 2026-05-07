import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({ baseURL: API_BASE_URL });

// ── JWT Interceptor ──────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (window.location.hash !== '#/login') {
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth Service ─────────────────────────────────────
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login/', { username, password });
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  },
  signup: async (userData) => {
    const response = await api.post('/auth/signup/', userData);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  getProfile: async () => {
    const response = await api.get('/auth/me/');
    return response.data;
  },
};

// ── Chat Service ─────────────────────────────────────
export const chatService = {
  getChats: async () => {
    const response = await api.get('/chat/');
    return response.data;
  },
  createChat: async () => {
    const response = await api.post('/chat/');
    return response.data;
  },
  /**
   * Send a message with full conversation history for context.
   * @param {string} chatId
   * @param {string} content - latest user message
   * @param {Array}  history - [{role, content}, ...] previous messages
   * @param {string} studyMode - 'normal' | 'exam' | 'deep'
   * @param {string} college   - user's college for personalisation
   */
  sendMessage: async (chatId, content, history = [], studyMode = 'normal', college = '') => {
    const response = await api.post(`/chat/${chatId}/messages/`, {
      content,
      history,
      study_mode: studyMode,
      college,
    });
    return response.data;
  },
  regenerateMessage: async (chatId, messageId) => {
    const response = await api.post(`/chat/${chatId}/messages/${messageId}/regenerate/`);
    return response.data;
  },
  likeMessage: async (chatId, messageId, feedback) => {
    const response = await api.post(`/chat/${chatId}/messages/${messageId}/feedback/`, { feedback });
    return response.data;
  },
};

// ── AI Services ──────────────────────────────────────
export const aiService = {
  /**
   * Generate notes from text (from file upload or manual).
   * @param {string} text
   * @param {string} mode - 'normal' | 'exam' | 'deep'
   * @param {string} college
   */
  generateNotes: async (text, mode = 'normal', college = '') => {
    const response = await api.post('/ai/generate-notes/', { text, mode, college });
    return response.data;
  },
  predictPYQ: async (subject, college = '') => {
    const response = await api.post('/ai/predict-pyq/', { subject, college });
    return response.data;
  },
};

// ── Admin Service ─────────────────────────────────────
export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/');
    return response.data;
  },
  getColleges: async () => {
    const response = await api.get('/admin/colleges/');
    return response.data;
  },
  getSubjects: async () => {
    const response = await api.get('/admin/subjects/');
    return response.data;
  },
  getPapers: async () => {
    const response = await api.get('/admin/papers/');
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/admin/users/');
    return response.data;
  },
  uploadPaper: async (formData) => {
    const response = await api.post('/admin/papers/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export default api;

import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const interviewApi = {
  start: (data) => api.post('/interviews/start', data),
  submitAnswer: (questionId, answer) => api.post(`/interviews/questions/${questionId}/answer`, { answer }),
  getSession: (id) => api.get(`/interviews/sessions/${id}`),
  getHistory: () => api.get('/interviews/history'),
};

export const leaderboardApi = {
  get: (params) => api.get('/leaderboard', { params }),
  getFilters: () => api.get('/leaderboard/filters'),
};

export const codingApi = {
  generate: (data) => api.post('/coding/generate', data),
  submit: (problemId, data) => api.post(`/coding/problems/${problemId}/submit`, data),
  getProblem: (id) => api.get(`/coding/problems/${id}`),
  getHistory: () => api.get('/coding/history'),
};

export default api;

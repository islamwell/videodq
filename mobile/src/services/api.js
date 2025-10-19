import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const videoService = {
  getVideos: async (params = {}) => {
    const response = await apiClient.get('/videos', { params });
    return response.data;
  },

  getVideoById: async (id) => {
    const response = await apiClient.get(`/videos/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get('/videos/meta/categories');
    return response.data;
  },

  createVideo: async (data) => {
    const response = await apiClient.post('/videos', data);
    return response.data;
  },

  updateVideo: async (id, data) => {
    const response = await apiClient.put(`/videos/${id}`, data);
    return response.data;
  },

  deleteVideo: async (id) => {
    const response = await apiClient.delete(`/videos/${id}`);
    return response.data;
  },
};

export default apiClient;

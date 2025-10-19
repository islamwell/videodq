import axios from 'axios';

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
const API_BASE_URL = apiBase ? `${apiBase}/api` : '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Video {
  _id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: number;
  speaker: string;
  category: string;
  tags: string[];
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideosResponse {
  success: boolean;
  data: Video[];
  total: number;
  limit: number;
  skip: number;
}

export interface VideoResponse {
  success: boolean;
  data: Video;
}

export const videoService = {
  getVideos: async (params: Record<string, any> = {}): Promise<VideosResponse> => {
    const response = await apiClient.get('/videos', { params });
    return response.data;
  },

  getVideoById: async (id: string): Promise<VideoResponse> => {
    const response = await apiClient.get(`/videos/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<{ success: boolean; data: string[] }> => {
    const response = await apiClient.get('/videos/meta/categories');
    return response.data;
  },

  createVideo: async (data: Partial<Video>): Promise<VideoResponse> => {
    const response = await apiClient.post('/videos', data);
    return response.data;
  },

  updateVideo: async (id: string, data: Partial<Video>): Promise<VideoResponse> => {
    const response = await apiClient.put(`/videos/${id}`, data);
    return response.data;
  },

  deleteVideo: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/videos/${id}`);
    return response.data;
  },
};

export const playlistService = {
  getPlaylists: async () => {
    const response = await apiClient.get('/playlists');
    return response.data;
  },
  getPlaylistBySlug: async (slug: string) => {
    const response = await apiClient.get(`/playlists/${slug}`);
    return response.data;
  }
};

export default apiClient;

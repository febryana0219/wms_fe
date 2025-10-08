import { apiClient } from './apiClient';
import { LoginResponse, ApiResponse, User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', { email, password });
  },

  async logout(): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>('/auth/logout');
  },

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/refresh', { refresh_token: refreshToken });
  },

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
  },
};
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  ApiResponse, 
  User,
  UsersListResponse 
} from '../types/auth.types';
import apiClient from './api';

class AuthService {
  private api = apiClient.getInstance();

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    
    // Guardar tokens solo si la respuesta es exitosa
    if (response.data.data?.access_token && response.data.data?.refresh_token) {
      localStorage.setItem('access_token', response.data.data.access_token);
      localStorage.setItem('refresh_token', response.data.data.refresh_token);
    }
    
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async refreshToken(): Promise<ApiResponse<{ access_token: string }>> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    // Si no hay refresh token, no hacer la petición
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.api.post<ApiResponse<{ access_token: string }>>(
      '/auth/refresh', 
      {}, 
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    return response.data;
  }

  async getProfile(): Promise<User> {
    // Verificar autenticación antes de hacer la petición
    if (!apiClient.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const response = await this.api.get<ApiResponse<User>>('/auth/profile');
    return response.data.data!;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    if (!apiClient.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const response = await this.api.put<ApiResponse<User>>('/auth/profile', data);
    return response.data.data!;
  }

  async getUsers(page = 1, perPage = 20): Promise<UsersListResponse> {
    if (!apiClient.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const response = await this.api.get<ApiResponse<UsersListResponse>>(
      `/auth/users?page=${page}&per_page=${perPage}`
    );
    return response.data.data!;
  }

  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    if (!apiClient.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const response = await this.api.put<ApiResponse<User>>(`/auth/users/${userId}`, data);
    return response.data.data!;
  }

  async toggleUserStatus(userId: number): Promise<User> {
    if (!apiClient.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const response = await this.api.patch<ApiResponse<User>>(`/auth/users/${userId}/toggle-status`);
    return response.data.data!;
  }

  // Método para logout
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Opcional: llamar al endpoint de logout del backend
    this.api.post('/auth/logout');
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Método para verificar autenticación
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }
}

export default new AuthService();
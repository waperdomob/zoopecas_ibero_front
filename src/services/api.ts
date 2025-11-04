import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

class ApiClient {
  private api: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Si el error es 401 y no es una solicitud de refresh
        if (error.response?.status === 401 && 
            !originalRequest._retry && 
            !originalRequest.url?.includes('/auth/refresh')) {
          
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              // Reintentar la solicitud original con el nuevo token
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.handleLogout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    
    // Si no hay refresh token, no intentar refrescar
    if (!refreshToken) {
      this.handleLogout();
      return null;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      let newAccessToken: string | undefined;
    
      if (response.data.access_token) {
        newAccessToken = response.data.access_token;
      } else if (response.data.data?.access_token) {
        newAccessToken = response.data.data.access_token;
      }
      if (newAccessToken) {
        localStorage.setItem('access_token', newAccessToken);
        return newAccessToken;
      } else {
        console.error('No access token in refresh response:', response.data);
        this.handleLogout();
        return null;
      }
      
    } catch (error) {
      console.error('Refresh token failed:', error);
      this.handleLogout();
      return null;
    }
  }

  private handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Redirigir al login solo si estamos en el cliente
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  public getInstance(): AxiosInstance {
    return this.api;
  }

  // Método para verificar si hay un usuario autenticado
  public isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }
}

export default new ApiClient();
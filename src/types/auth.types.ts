export enum UserRole {
  ADMINISTRADOR = "Administrador",
  VETERINARIO = "Veterinario",
  ASISTENTE = "Asistente",
  RECEPCIONISTA = "Recepcionista"
}

export interface User {
  id: number;
  usuario_id?: number;
  username: string;
  email: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  rol: UserRole;
  activo?: boolean;
  ultimo_acceso?: string;
  fecha_creacion?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  rol?: UserRole;
}

export interface AuthResponse {
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    user: User;
  };
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  error?: string;
}

export interface PaginationData {
  page: number;
  pages: number;
  per_page: number;
  total: number;
}

export interface UsersListResponse {
  users: User[];
  pagination: PaginationData;
}
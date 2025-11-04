import { ApiResponse, PaginationData } from '../types/auth.types';
import { Cita, CitaFormData, DisponibilidadResponse } from '../types/appointment.types';
import apiClient from './api';

interface CitasListResponse {
  citas: Cita[];
  pagination: PaginationData;
}

class AppointmentService {
  private api = apiClient.getInstance();

  async createCita(data: CitaFormData): Promise<Cita> {
    const response = await this.api.post<ApiResponse<Cita>>('/appointments', data);
    return response.data.data!;
  }

  async getCitas(params?: {
    page?: number;
    per_page?: number;
    fecha?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    cliente_id?: number;
    mascota_id?: number;
    veterinario_id?: number;
    estado?: string;
  }): Promise<CitasListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await this.api.get<ApiResponse<CitasListResponse>>(
      `/appointments?${queryParams.toString()}`
    );
    return response.data.data!;
  }

  async getCita(id: number): Promise<Cita> {
    const response = await this.api.get<ApiResponse<Cita>>(`/appointments/${id}`);
    return response.data.data!;
  }

  async getCitasHoy(): Promise<Cita[]> {
    const response = await this.api.get<ApiResponse<Cita[]>>('/appointments/hoy');
    return response.data.data!;
  }

  async getCitasProximas(): Promise<Cita[]> {
    const response = await this.api.get<ApiResponse<Cita[]>>('/appointments/proximas');
    return response.data.data!;
  }

  async updateCita(id: number, data: Partial<CitaFormData>): Promise<Cita> {
    const response = await this.api.put<ApiResponse<Cita>>(`/appointments/${id}`, data);
    return response.data.data!;
  }

  async cancelarCita(id: number): Promise<Cita> {
    const response = await this.api.post<ApiResponse<Cita>>(`/appointments/${id}/cancelar`);
    return response.data.data!;
  }

  async confirmarCita(id: number): Promise<Cita> {
    const response = await this.api.post<ApiResponse<Cita>>(`/appointments/${id}/confirmar`);
    return response.data.data!;
  }

  async completarCita(id: number): Promise<Cita> {
    const response = await this.api.post<ApiResponse<Cita>>(`/appointments/${id}/completar`);
    return response.data.data!;
  }

  async checkDisponibilidad(fecha: string, veterinarioId?: number): Promise<DisponibilidadResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('fecha', fecha);
    if (veterinarioId) {
      queryParams.append('veterinario_id', veterinarioId.toString());
    }

    const response = await this.api.get<ApiResponse<DisponibilidadResponse>>(
      `/appointments/disponibilidad?${queryParams.toString()}`
    );
    return response.data.data!;
  }
}

export default new AppointmentService();
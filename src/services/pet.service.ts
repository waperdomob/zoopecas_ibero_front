import { ApiResponse, PaginationData } from '../types/auth.types';
import { Mascota, MascotaFormData } from '../types/pet.types';
import apiClient from './api';

interface MascotasListResponse {
  mascotas: Mascota[];
  pagination: PaginationData;
}

class PetService {
  private api = apiClient.getInstance();

  async createMascota(data: MascotaFormData): Promise<Mascota> {
    const response = await this.api.post<ApiResponse<Mascota>>('/pets', data);
    return response.data.data!;
  }

  async getMascotas(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    cliente_id?: number;
    especie?: string;
    activo?: boolean;
  }): Promise<MascotasListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.cliente_id) queryParams.append('cliente_id', params.cliente_id.toString());
      if (params.especie) queryParams.append('especie', params.especie);
      if (params.activo !== undefined) queryParams.append('activo', params.activo.toString());
    }

    const response = await this.api.get<ApiResponse<MascotasListResponse>>(
      `/pets?${queryParams.toString()}`
    );
    return response.data.data!;
  }

  async getMascota(id: number): Promise<Mascota> {
    const response = await this.api.get<ApiResponse<Mascota>>(`/pets/${id}`);
    return response.data.data!;
  }

  async updateMascota(id: number, data: Partial<MascotaFormData>): Promise<Mascota> {
    const response = await this.api.put<ApiResponse<Mascota>>(`/pets/${id}`, data);
    return response.data.data!;
  }

  async deleteMascota(id: number): Promise<void> {
    await this.api.delete(`/pets/${id}`);
  }

  async getMascotasByCliente(clienteId: number): Promise<Mascota[]> {
    const response = await this.api.get(`/clients/${clienteId}/mascotas`);
    return response.data.data;
  }
}

export default new PetService();
import { ApiResponse, PaginationData } from '../types/auth.types';
import { Cliente, ClienteFormData } from '../types/client.types';
import apiClient from './api';

interface ClientesListResponse {
  clientes: Cliente[];
  pagination: PaginationData;
}

class ClientService {
  private api = apiClient.getInstance();

  async createCliente(data: ClienteFormData): Promise<Cliente> {
    const response = await this.api.post<ApiResponse<Cliente>>('/clients', data);
    return response.data.data!;
  }

  async getClientes(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    activo?: boolean;
  }): Promise<ClientesListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.activo !== undefined) queryParams.append('activo', params.activo.toString());
    }

    const response = await this.api.get<ApiResponse<ClientesListResponse>>(
      `/clients?${queryParams.toString()}`
    );
    return response.data.data!;
  }

  async getCliente(id: number, includeMascotas = false): Promise<Cliente> {
    const params = includeMascotas ? '?include_mascotas=true' : '';
    const response = await this.api.get<ApiResponse<Cliente>>(`/clients/${id}${params}`);
    return response.data.data!;
  }

  async getClienteByDocumento(documento: string): Promise<Cliente> {
    const response = await this.api.get<ApiResponse<Cliente>>(`/clients/documento/${documento}`);
    return response.data.data!;
  }

  async updateCliente(id: number, data: Partial<ClienteFormData>): Promise<Cliente> {
    const response = await this.api.put<ApiResponse<Cliente>>(`/clients/${id}`, data);
    return response.data.data!;
  }

  async deleteCliente(id: number): Promise<void> {
    await this.api.delete(`/clients/${id}`);
  }

  async getClienteMascotas(id: number): Promise<any[]> {
    const response = await this.api.get<ApiResponse<any[]>>(`/clients/${id}/mascotas`);
    return response.data.data!;
  }
}

export default new ClientService();
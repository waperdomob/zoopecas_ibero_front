import { ApiResponse, PaginationData } from '../types/auth.types';
import { 
  HistoriaClinica, 
  Consulta, 
  Veterinario, 
  SeguimientoPaciente 
} from '../types/medical.types';
import apiClient from './api';

interface HistoriasListResponse {
  historias: HistoriaClinica[];
  pagination: PaginationData;
}

interface ConsultasListResponse {
  consultas: Consulta[];
  pagination: PaginationData;
}

class MedicalService {
  private api = apiClient.getInstance();

  // Historia Clínica
  async getHistorias(params?: {
    page?: number;
    per_page?: number;
    mascota_id?: number;
  }): Promise<HistoriasListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params.mascota_id) queryParams.append('mascota_id', params.mascota_id.toString());
    }

    const response = await this.api.get<ApiResponse<HistoriasListResponse>>(
      `/medical/historias?${queryParams.toString()}`
    );
    return response.data.data!;
  }

  async getHistoria(id: number): Promise<HistoriaClinica> {
    const response = await this.api.get<ApiResponse<HistoriaClinica>>(`/medical/historias/${id}`);
    return response.data.data!;
  }

  async updateHistoria(id: number, data: Partial<HistoriaClinica>): Promise<HistoriaClinica> {
    const response = await this.api.put<ApiResponse<HistoriaClinica>>(
      `/medical/historias/${id}`, 
      data
    );
    return response.data.data!;
  }

  // Consultas
  async createConsulta(data: Partial<Consulta>): Promise<Consulta> {
    const response = await this.api.post<ApiResponse<Consulta>>('/medical/consultas', data);
    return response.data.data!;
  }

  async getConsultas(params?: {
    page?: number;
    per_page?: number;
    historia_id?: number;
    mascota_id?: number;
    veterinario_id?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<ConsultasListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params.historia_id) queryParams.append('historia_id', params.historia_id.toString());
      if (params.mascota_id) queryParams.append('mascota_id', params.mascota_id.toString());
      if (params.veterinario_id) queryParams.append('veterinario_id', params.veterinario_id.toString());
      if (params.fecha_desde) queryParams.append('fecha_desde', params.fecha_desde);
      if (params.fecha_hasta) queryParams.append('fecha_hasta', params.fecha_hasta);
    }

    const response = await this.api.get<ApiResponse<ConsultasListResponse>>(
      `/medical/consultas?${queryParams.toString()}`
    );
    return response.data.data!;
  }

  async getConsulta(id: number): Promise<Consulta> {
    const response = await this.api.get<ApiResponse<Consulta>>(`/medical/consultas/${id}`);
    return response.data.data!;
  }

  async updateConsulta(id: number, data: Partial<Consulta>): Promise<Consulta> {
    const response = await this.api.put<ApiResponse<Consulta>>(
      `/medical/consultas/${id}`, 
      data
    );
    return response.data.data!;
  }

  // Seguimientos
  async createSeguimiento(data: Partial<SeguimientoPaciente>): Promise<SeguimientoPaciente> {
    const response = await this.api.post<ApiResponse<SeguimientoPaciente>>(
      '/medical/seguimientos', 
      data
    );
    return response.data.data!;
  }

  async getSeguimientos(consultaId: number): Promise<SeguimientoPaciente[]> {
    const response = await this.api.get<ApiResponse<SeguimientoPaciente[]>>(
      `/medical/seguimientos/${consultaId}`
    );
    return response.data.data!;
  }

  // Veterinarios
  async getVeterinarios(): Promise<Veterinario[]> {
    const response = await this.api.get<ApiResponse<Veterinario[]>>('/medical/veterinarios');
    return response.data.data!;
  }

  async createVeterinario(data: Partial<Veterinario>): Promise<Veterinario> {
    const response = await this.api.post<ApiResponse<Veterinario>>(
      '/medical/veterinarios', 
      data
    );
    return response.data.data!;
  }
}

export default new MedicalService();
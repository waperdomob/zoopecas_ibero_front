import { Mascota } from "./pet.types";

export interface HistoriaClinica {
  historia_id: number;
  mascota_id: number;
  caracteristicas_especiales?: string;
  queja_principal?: string;
  tratamientos_previos?: string;
  enfermedades_anteriores?: string;
  cirugias_anteriores?: string;
  tipo_dieta?: string;
  detalle_dieta?: string;
  medicina_preventiva?: string;
  observaciones_generales?: string;
  peso_inicial?: number;
  activa: boolean;
  mascota?: Mascota;
  consultas?: Consulta[];
}

export interface Consulta {
  consulta_id: number;
  historia_id: number;
  veterinario_id: number;
  fecha_consulta: string;
  hora_consulta: string;
  motivo_consulta: string;
  temperatura?: number;
  peso?: number;
  pulso?: number;
  respiracion?: number;
  diagnostico?: string;
  tratamiento_ideal?: string;
  tratamiento_instaurado?: string;
  pronostico?: string;
  costo_consulta?: number;
  observaciones?: string;
  proxima_cita?: string;
  veterinario?: Veterinario;
}

export interface Veterinario {
  veterinario_id: number;
  nombre: string;
  apellidos: string;
  licencia: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}

export interface SeguimientoPaciente {
  seguimiento_id: number;
  consulta_id: number;
  fecha_seguimiento: string;
  descripcion: string;
  realizado_por: string;
}

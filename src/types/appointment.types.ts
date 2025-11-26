import { Cliente } from "./client.types";
import { Veterinario } from "./medical.types";
import { Mascota } from "./pet.types";

export enum EstadoCita {
  PROGRAMADA = 'Programada',
  CONFIRMADA = 'Confirmada',
  EN_CURSO = 'En curso',
  COMPLETADA = 'Completada',
  CANCELADA = 'Cancelada',
  NO_ASISTIO = 'No asistió'
}

export interface Cita {
  cita_id: number;
  cliente_id: number;
  mascota_id: number;
  veterinario_id?: number;
  fecha_cita: string;
  hora_cita: string;
  motivo: string;
  estado: 'Programada' | 'Confirmada' | 'En curso' | 'Completada' | 'Cancelada' | 'No asistió';
  observaciones?: string;
  fecha_creacion: string;
  activa: boolean;
  fecha_registro?: string;
  cliente?: Cliente;
  mascota?: Mascota;
  veterinario?: Veterinario;
}

export interface CitaFormData {
  cliente_id: number;
  mascota_id: number;
  veterinario_id?: number;
  fecha_cita: string;
  hora_cita: string;
  motivo: string;
  observaciones?: string;
}

export interface CitaUpdateData {
  veterinario_id?: number;
  fecha_cita?: string;
  hora_cita?: string;
  motivo?: string;
  estado?: string;
  observaciones?: string;
  activa?: boolean;
}

export interface CitaFilters {
  fecha?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  cliente_id?: number;
  mascota_id?: number;
  veterinario_id?: number;
  estado?: string;
  page?: number;
  per_page?: number;
}

export interface DisponibilidadParams {
  fecha: string;
  veterinario_id?: number;
}

export interface DisponibilidadResponse {
  fecha: string;
  veterinario_id?: number;
  horarios_disponibles: string[];
  horarios_ocupados: string[];
}
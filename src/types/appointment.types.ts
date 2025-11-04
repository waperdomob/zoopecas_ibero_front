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
  motivo_cita: string;
  estado: EstadoCita;
  observaciones?: string;
  costo_consulta?: number;
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
  motivo_cita: string;
  observaciones?: string;
  costo_consulta?: number;
}

export interface DisponibilidadResponse {
  fecha: string;
  veterinario_id?: number;
  horarios_disponibles: string[];
  horarios_ocupados: string[];
}
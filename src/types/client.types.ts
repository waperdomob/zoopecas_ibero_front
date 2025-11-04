import { Mascota } from "./pet.types";

export interface Cliente {
  cliente_id: number;
  documento_identidad: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  nombre_completo?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  fecha_registro?: string;
  activo: boolean;
  observaciones?: string;
  total_mascotas?: number;
  mascotas?: Mascota[];
}

export interface ClienteFormData {
  documento_identidad?: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
}
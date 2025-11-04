import { Cliente } from "./client.types";

export interface Mascota {
  mascota_id: number;
  cliente_id: number;
  nombre: string;
  especie: string;
  raza?: string;
  sexo: 'Macho' | 'Hembra';
  fecha_nacimiento?: string;
  edad?: string;
  edad_meses?: string;
  color?: string;
  peso_actual?: number;
  microchip?: string;
  esterilizado: boolean;
  observaciones?: string;
  fecha_registro?: string;
  activo: boolean;
  propietario: Cliente;
}

export interface MascotaFormData {
  cliente_id: number;
  nombre: string;
  especie: string;
  raza?: string;
  sexo: string;
  fecha_nacimiento?: string;
  color?: string;
  peso_actual?: number;
  microchip?: string;
  esterilizado?: boolean;
}
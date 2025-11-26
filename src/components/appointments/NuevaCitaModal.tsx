// src/components/modals/NuevaCitaModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid as MuiGrid,
  Autocomplete,
  CircularProgress,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import appointmentService from '../../services/appointment.service';
import clientService from '../../services/client.service';
import petService from '../../services/pet.service';
import medicalService from '../../services/medical.service';
import { Cliente } from '../../types/client.types';
import { Mascota } from '../../types/pet.types';
import { Veterinario } from '../../types/medical.types';
import { CitaFormData } from '../../types/appointment.types';

const Grid = (props: any) => <MuiGrid {...props} />;

interface NuevaCitaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NuevaCitaModal: React.FC<NuevaCitaModalProps> = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos para los selects
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [mascotasPorCliente, setMascotasPorCliente] = useState<Mascota[]>([]);

  // Formulario
  const [formData, setFormData] = useState<Partial<CitaFormData>>({
    motivo: '',
    observaciones: '',
  });
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedMascota, setSelectedMascota] = useState<Mascota | null>(null);
  const [selectedVeterinario, setSelectedVeterinario] = useState<Veterinario | null>(null);
  const [fechaCita, setFechaCita] = useState<Date | null>(new Date());
  const [horaCita, setHoraCita] = useState<Date | null>(null);

  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  useEffect(() => {
    if (selectedCliente) {
      loadMascotasPorCliente(selectedCliente.cliente_id);
    } else {
      setMascotasPorCliente([]);
      setSelectedMascota(null);
    }
  }, [selectedCliente]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [clientesRes, mascotasRes, veterinariosRes] = await Promise.all([
        clientService.getClientes({ activo: true, per_page: 100 }),
        petService.getMascotas({ activo: true, per_page: 100 }),
        medicalService.getVeterinarios(),
      ]);

      setClientes(clientesRes.clientes);
      setMascotas(mascotasRes.mascotas);
      setVeterinarios(veterinariosRes.filter(v => v.activo));
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoadingData(false);
    }
  };

  const loadMascotasPorCliente = async (clienteId: number) => {
    try {
      const mascotasCliente = await petService.getMascotasByCliente(clienteId);
      setMascotasPorCliente(mascotasCliente);
    } catch (err) {
      console.error('Error al cargar mascotas del cliente:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);

      // Validaciones
      if (!selectedCliente) {
        setError('Debe seleccionar un cliente');
        return;
      }

      if (!selectedMascota) {
        setError('Debe seleccionar una mascota');
        return;
      }

      if (!fechaCita) {
        setError('Debe seleccionar una fecha');
        return;
      }

      if (!horaCita) {
        setError('Debe seleccionar una hora');
        return;
      }

      if (!formData.motivo?.trim()) {
        setError('Debe ingresar el motivo de la cita');
        return;
      }

      setLoading(true);

      const citaData: CitaFormData = {
        cliente_id: selectedCliente.cliente_id,
        mascota_id: selectedMascota.mascota_id,
        veterinario_id: selectedVeterinario?.veterinario_id,
        fecha_cita: format(fechaCita, 'yyyy-MM-dd'),
        hora_cita: format(horaCita, 'HH:mm'),
        motivo: formData.motivo!,
        observaciones: formData.observaciones,
      };

      await appointmentService.createCita(citaData);
      
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Error al crear cita:', err);
      setError(err.response?.data?.message || 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      motivo: '',
      observaciones: '',
    });
    setSelectedCliente(null);
    setSelectedMascota(null);
    setSelectedVeterinario(null);
    setFechaCita(new Date());
    setHoraCita(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Nueva Cita</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Cliente */}
              <Grid item xs={12} lg={4}>
                <Autocomplete
                  options={clientes}
                  getOptionLabel={(option) => 
                    `${option.nombre} ${option.apellidos} - ${option.documento_identidad}`
                  }
                  sx={{
                        '& .MuiOutlinedInput-root': {
                        minWidth: 150, // altura estándar de los TextField de MUI
                        },
                    }}
                  value={selectedCliente}
                  onChange={(_, newValue) => setSelectedCliente(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cliente *"
                      placeholder="Buscar cliente..."
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body2">
                          {option.nombre} {option.apellidos}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.documento_identidad} - {option.telefono}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
              </Grid>

              {/* Mascota */}
              <Grid item xs={12} lg={4}>
                <Autocomplete
                  options={mascotasPorCliente.length > 0 ? mascotasPorCliente : mascotas}
                  getOptionLabel={(option) => 
                    `${option.nombre} - ${option.especie} (${option.raza || 'Sin raza'})`
                  }
                  value={selectedMascota}
                  onChange={(_, newValue) => setSelectedMascota(newValue)}
                  disabled={!selectedCliente && mascotasPorCliente.length === 0}
                  sx={{
                        '& .MuiOutlinedInput-root': {
                        minWidth: 150, // altura estándar de los TextField de MUI
                        },
                    }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Mascota *"
                      placeholder="Seleccionar mascota..."
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                      helperText={
                        selectedCliente && mascotasPorCliente.length === 0
                          ? 'Este cliente no tiene mascotas registradas'
                          : ''
                      }
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body2">
                          {option.nombre} - {option.especie}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.raza || 'Sin raza'} • {option.sexo}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
              </Grid>

              {/* Veterinario */}
              <Grid item xs={12} lg={4}>
                <Autocomplete
                  options={veterinarios}
                  getOptionLabel={(option) => 
                    `${option.nombre} ${option.apellidos}`
                  }
                  value={selectedVeterinario}
                  onChange={(_, newValue) => setSelectedVeterinario(newValue)}
                  sx={{
                        '& .MuiOutlinedInput-root': {
                        minWidth: 150, // altura estándar de los TextField de MUI
                        },
                    }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Veterinario (Opcional)"
                      placeholder="Seleccionar veterinario..."
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body2">
                          {option.nombre} {option.apellidos}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Lic: {option.licencia}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
              </Grid>

              {/* Fecha */}
              <Grid item xs={12} lg={4}>
                <DatePicker
                  label="Fecha de la cita *"
                  value={fechaCita}
                  onChange={(newValue) => setFechaCita(newValue)}
                  minDate={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>

              {/* Hora */}
              <Grid item xs={12} lg={4}>
                <TimePicker
                  label="Hora de la cita *"
                  value={horaCita}
                  onChange={(newValue) => setHoraCita(newValue)}
                  ampm={false}
                  minutesStep={15}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>

              {/* Motivo */}
              <Grid item xs={12} lg={4}>
                <TextField
                  fullWidth
                  label="Motivo *"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  placeholder="Ej: Vacunación, Consulta..."
                />
              </Grid>

              {/* Observaciones */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  sx={{
                        '& .MuiOutlinedInput-root': {
                        minWidth: 500, // altura estándar de los TextField de MUI
                        },
                    }}
                  multiline
                  rows={1}
                  placeholder="Observaciones adicionales..."
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || loadingData}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Guardando...' : 'Crear Cita'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NuevaCitaModal;
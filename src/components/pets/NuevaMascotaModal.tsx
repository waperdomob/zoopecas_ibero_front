// src/components/modals/NuevaMascotaModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid as MuiGrid,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Alert,
  Box,
  Typography,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import petService from '../../services/pet.service';
import clientService from '../../services/client.service';
import { Cliente } from '../../types/client.types';
import { MascotaFormData } from '../../types/pet.types';

const Grid = (props: any) => <MuiGrid {...props} />;

interface NuevaMascotaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientePreseleccionado?: Cliente;
}

const NuevaMascotaModal: React.FC<NuevaMascotaModalProps> = ({ 
  open, 
  onClose, 
  onSuccess,
  clientePreseleccionado 
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(clientePreseleccionado || null);

  const [formData, setFormData] = useState<Partial<MascotaFormData>>({
    nombre: '',
    especie: '',
    raza: '',
    sexo: '',
    color: '',
    peso_actual: undefined,
    microchip: '',
    esterilizado: false,
  });

  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);

  const especiesComunes = ['Perro', 'Gato', 'Ave', 'Conejo', 'Hámster', 'Otro'];
  const razasPerro = [
    'Labrador', 'Golden Retriever', 'Pastor Alemán', 'Bulldog', 'Beagle', 
    'Poodle', 'Chihuahua', 'Mestizo', 'Otro'
  ];
  const razasGato = [
    'Persa', 'Siamés', 'Maine Coon', 'Británico', 'Bengalí', 
    'Criollo', 'Mestizo', 'Otro'
  ];

  useEffect(() => {
    if (open && !clientePreseleccionado) {
      loadClientes();
    }
  }, [open]);

  useEffect(() => {
    if (clientePreseleccionado) {
      setSelectedCliente(clientePreseleccionado);
    }
  }, [clientePreseleccionado]);

  const loadClientes = async () => {
    try {
      setLoadingClientes(true);
      const response = await clientService.getClientes({ activo: true, per_page: 100 });
      setClientes(response.clientes);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError('Error al cargar la lista de clientes');
    } finally {
      setLoadingClientes(false);
    }
  };

  const getRazasPorEspecie = () => {
    if (formData.especie === 'Perro') return razasPerro;
    if (formData.especie === 'Gato') return razasGato;
    return [];
  };

  const handleSubmit = async () => {
    try {
      setError(null);

      // Validaciones
      if (!selectedCliente) {
        setError('Debe seleccionar un cliente');
        return;
      }

      if (!formData.nombre?.trim()) {
        setError('Debe ingresar el nombre de la mascota');
        return;
      }

      if (!formData.especie) {
        setError('Debe seleccionar la especie');
        return;
      }

      if (!formData.sexo) {
        setError('Debe seleccionar el sexo');
        return;
      }

      setLoading(true);

      const mascotaData: MascotaFormData = {
        cliente_id: selectedCliente.cliente_id,
        nombre: formData.nombre!,
        especie: formData.especie!,
        raza: formData.raza,
        sexo: formData.sexo!,
        fecha_nacimiento: fechaNacimiento ? format(fechaNacimiento, 'yyyy-MM-dd') : undefined,
        color: formData.color,
        peso_actual: formData.peso_actual,
        microchip: formData.microchip,
        esterilizado: formData.esterilizado,
      };

      await petService.createMascota(mascotaData);
      
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Error al crear mascota:', err);
      setError(err.response?.data?.message || 'Error al crear la mascota');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!clientePreseleccionado) {
      setSelectedCliente(null);
    }
    setFormData({
      nombre: '',
      especie: '',
      raza: '',
      sexo: '',
      color: '',
      peso_actual: undefined,
      microchip: '',
      esterilizado: false,
    });
    setFechaNacimiento(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Nueva Mascota</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Cliente */}
            {!clientePreseleccionado && (
                <Grid item xs={12} lg={12}>
                    <Autocomplete
                        options={clientes}
                        getOptionLabel={(option) =>
                            `${option.nombre} ${option.apellidos} - ${option.documento_identidad}`
                        }
                        value={selectedCliente}
                        onChange={(_, newValue) => setSelectedCliente(newValue)}
                        loading={loadingClientes}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                            minWidth: 150, // altura estándar de los TextField de MUI
                            },
                        }}
                        renderInput={(params) => (
                            <TextField
                            {...params}
                            label="Cliente *"
                            placeholder="Buscar cliente..."
                            slotProps={{
                                inputLabel: {
                                shrink: true,
                                },
                                input: {
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                    {loadingClientes ? <CircularProgress size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                    </>
                                ),
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
            )}

            {clientePreseleccionado && (
              <Grid item xs={12} lg={4}>
                <Alert severity="info">
                  Mascota para: <strong>{clientePreseleccionado.nombre} {clientePreseleccionado.apellidos}</strong>
                </Alert>
              </Grid>
            )}

            {/* Nombre */}
            <Grid item xs={12} lg={4}>
              <TextField
                fullWidth
                label="Nombre *"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Max, Luna, Rocky..."
              />
            </Grid>

            {/* Especie */}
            <Grid item xs={12} lg={4}>
              <TextField
                select
                fullWidth
                label="Especie *"
                value={formData.especie || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  especie: e.target.value,
                  raza: '' // Reset raza cuando cambia especie
                })}
                placeholder="Seleccionar especie"
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                  select: {
                    displayEmpty: true,
                    renderValue: (value: any) => value === '' ? 'Seleccionar especie' : value
                  }
                }}
              >
                <MenuItem value="" disabled>Seleccionar especie</MenuItem>
                {especiesComunes.map((especie) => (
                  <MenuItem key={especie} value={especie}>
                    {especie}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Sexo */}
            <Grid item xs={12} lg={4}>
              <TextField
                select
                fullWidth
                label="Sexo *"
                value={formData.sexo || ''}
                onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                  select: {
                    displayEmpty: true,
                    renderValue: (value: any) => value === '' ? 'Seleccionar sexo' : value
                  }
                }}
              >
                <MenuItem value="" disabled>Seleccionar sexo</MenuItem>
                <MenuItem value="Macho">Macho</MenuItem>
                <MenuItem value="Hembra">Hembra</MenuItem>
              </TextField>
            </Grid>

            {/* Raza */}
            {(formData.especie === 'Perro' || formData.especie === 'Gato') && (
              <Grid item xs={12} lg={4}>
                <Autocomplete
                  options={getRazasPorEspecie()}
                  value={formData.raza}
                  onChange={(_, newValue) => setFormData({ ...formData, raza: newValue || '' })}
                  freeSolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Raza"
                      placeholder="Seleccionar o escribir..."
                    />
                  )}
                />
              </Grid>
            )}

            {/* Fecha de Nacimiento */}
            <Grid item xs={12} lg={4}>
              <DatePicker
                label="Fecha de Nacimiento"
                value={fechaNacimiento}
                onChange={(newValue) => setFechaNacimiento(newValue)}
                maxDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Grid>

            {/* Color */}
            <Grid item xs={12} lg={4}>
              <TextField
                fullWidth
                label="Color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Ej: Negro, Blanco, Café..."
              />
            </Grid>

            {/* Peso */}
            <Grid item xs={12} lg={4}>
              <TextField
                fullWidth
                label="Peso Actual (kg)"
                type="number"
                value={formData.peso_actual || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  peso_actual: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                inputProps={{ step: 0.1, min: 0 }}
              />
            </Grid>

            {/* Microchip */}
            <Grid item xs={12} lg={4}>
              <TextField
                fullWidth
                label="Microchip"
                value={formData.microchip}
                onChange={(e) => setFormData({ ...formData, microchip: e.target.value })}
                placeholder="Número de microchip..."
              />
            </Grid>

            {/* Esterilizado */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.esterilizado || false}
                    onChange={(e) => setFormData({ ...formData, esterilizado: e.target.checked })}
                  />
                }
                label="¿Está esterilizado/a?"
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Guardando...' : 'Crear Mascota'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NuevaMascotaModal;
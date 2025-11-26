import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid as MuiGrid,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import medicalService from '../../services/medical.service';
import petService from '../../services/pet.service';
import { Mascota } from '../../types/pet.types';
import { HistoriaClinica } from '../../types/medical.types';

const Grid = (props: any) => <MuiGrid {...props} />;

interface NuevaHistoriaClinicaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NuevaHistoriaClinicaModal: React.FC<NuevaHistoriaClinicaModalProps> = ({ 
  open, 
  onClose, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMascotas, setLoadingMascotas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [selectedMascota, setSelectedMascota] = useState<Mascota | null>(null);

  const [formData, setFormData] = useState<Partial<HistoriaClinica>>({
    caracteristicas_especiales: '',
    queja_principal: '',
    tratamientos_previos: '',
    enfermedades_anteriores: '',
    cirugias_anteriores: '',
    tipo_dieta: '',
    detalle_dieta: '',
    medicina_preventiva: '',
    observaciones_generales: '',
    peso_inicial: undefined,
  });

  useEffect(() => {
    if (open) {
      loadMascotas();
    }
  }, [open]);

  const loadMascotas = async () => {
    try {
      setLoadingMascotas(true);
      const response = await petService.getMascotas({ activo: true, per_page: 1000 });
      setMascotas(response.mascotas);
    } catch (err) {
      console.error('Error al cargar mascotas:', err);
      setError('Error al cargar la lista de mascotas');
    } finally {
      setLoadingMascotas(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);

      if (!selectedMascota) {
        setError('Debe seleccionar una mascota');
        return;
      }

      setLoading(true);

      // La historia clínica se crea automáticamente al registrar una mascota
      // Este modal es para actualizar la información de la historia
      const historiaData: Partial<HistoriaClinica> = {
        mascota_id: selectedMascota.mascota_id,
        caracteristicas_especiales: formData.caracteristicas_especiales,
        queja_principal: formData.queja_principal,
        tratamientos_previos: formData.tratamientos_previos,
        enfermedades_anteriores: formData.enfermedades_anteriores,
        cirugias_anteriores: formData.cirugias_anteriores,
        tipo_dieta: formData.tipo_dieta,
        detalle_dieta: formData.detalle_dieta,
        medicina_preventiva: formData.medicina_preventiva,
        observaciones_generales: formData.observaciones_generales,
        peso_inicial: formData.peso_inicial,
      };

      // Primero obtenemos la historia existente de la mascota
      const historias = await medicalService.getHistorias({ 
        mascota_id: selectedMascota.mascota_id 
      });

      if (historias.historias.length > 0) {
        // Si ya existe, actualizamos
        await medicalService.updateHistoria(
          historias.historias[0].historia_id, 
          historiaData
        );
      }
      
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Error al crear/actualizar historia clínica:', err);
      setError(err.response?.data?.message || 'Error al procesar la historia clínica');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      caracteristicas_especiales: '',
      queja_principal: '',
      tratamientos_previos: '',
      enfermedades_anteriores: '',
      cirugias_anteriores: '',
      tipo_dieta: '',
      detalle_dieta: '',
      medicina_preventiva: '',
      observaciones_generales: '',
      peso_inicial: undefined,
    });
    setSelectedMascota(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Iniciar Historia Clínica</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Mascota */}
            <Grid item xs={12} lg={4}>
              <Autocomplete
                options={mascotas}
                getOptionLabel={(option) => 
                  `${option.nombre} - ${option.especie} (${option.propietario?.nombre} ${option.propietario?.apellidos})`
                }
                value={selectedMascota}
                onChange={(_, newValue) => setSelectedMascota(newValue)}
                loading={loadingMascotas}
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
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingMascotas ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      <Typography variant="body2">
                        {option.nombre} - {option.especie}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.raza || 'Sin raza'} • Dueño: {option.propietario?.nombre}
                      </Typography>
                    </Box>
                  </li>
                )}
              />
            </Grid>

            {/* Peso Inicial */}
            <Grid item xs={12} lg={4}>
              <TextField
                fullWidth
                label="Peso Inicial"
                type="number"
                value={formData.peso_inicial || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  peso_inicial: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                  },
                }}
                inputProps={{ step: 0.1, min: 0 }}
              />
            </Grid>

            {/* Tipo de Dieta */}
            <Grid item xs={12} lg={4}>
              <TextField
                fullWidth
                label="Tipo de Dieta"
                value={formData.tipo_dieta}
                onChange={(e) => setFormData({ ...formData, tipo_dieta: e.target.value })}
                placeholder="Ej: Croquetas, BARF, Casera..."
              />
            </Grid>

            {/* Sección: Anamnesis */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Anamnesis
              </Typography>
            </Grid>

            <Grid item xs={12} lg={6}>
              <TextField
                fullWidth
                label="Queja Principal"
                value={formData.queja_principal}
                onChange={(e) => setFormData({ ...formData, queja_principal: e.target.value })}
                multiline
                rows={3}
                placeholder="Motivo de la consulta inicial..."
              />
            </Grid>

            <Grid item xs={12} lg={6}>
              <TextField
                fullWidth
                label="Características Especiales"
                value={formData.caracteristicas_especiales}
                onChange={(e) => setFormData({ ...formData, caracteristicas_especiales: e.target.value })}
                multiline
                rows={3}
                placeholder="Temperamento, comportamiento, alergias..."
              />
            </Grid>

            {/* Sección: Historial Médico */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Historial Médico
              </Typography>
            </Grid>

            <Grid item xs={12} lg={4}>
              <TextField
                fullWidth
                label="Tratamientos Previos"
                value={formData.tratamientos_previos}
                onChange={(e) => setFormData({ ...formData, tratamientos_previos: e.target.value })}
                multiline
                rows={3}
                placeholder="Medicamentos o tratamientos anteriores..."
              />
            </Grid>

            <Grid item xs={12} lg={4}>
              <TextField
                fullWidth
                label="Enfermedades Anteriores"
                value={formData.enfermedades_anteriores}
                onChange={(e) => setFormData({ ...formData, enfermedades_anteriores: e.target.value })}
                multiline
                rows={3}
                placeholder="Historial de enfermedades..."
              />
            </Grid>

            <Grid item xs={12} lg={4}>
              <TextField
                fullWidth
                label="Cirugías Anteriores"
                value={formData.cirugias_anteriores}
                onChange={(e) => setFormData({ ...formData, cirugias_anteriores: e.target.value })}
                multiline
                rows={3}
                placeholder="Cirugías realizadas..."
              />
            </Grid>

            {/* Sección: Nutrición y Prevención */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Nutrición y Prevención
              </Typography>
            </Grid>

            <Grid item xs={12} lg={6}>
              <TextField
                fullWidth
                label="Detalle de Dieta"
                value={formData.detalle_dieta}
                onChange={(e) => setFormData({ ...formData, detalle_dieta: e.target.value })}
                multiline
                rows={3}
                placeholder="Cantidad, horarios, marcas..."
              />
            </Grid>

            <Grid item xs={12} lg={6}>
              <TextField
                fullWidth
                label="Medicina Preventiva"
                value={formData.medicina_preventiva}
                onChange={(e) => setFormData({ ...formData, medicina_preventiva: e.target.value })}
                multiline
                rows={3}
                placeholder="Vacunas, desparasitaciones, controles..."
              />
            </Grid>

            {/* Observaciones Generales */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones Generales"
                value={formData.observaciones_generales}
                onChange={(e) => setFormData({ ...formData, observaciones_generales: e.target.value })}
                multiline
                rows={3}
                placeholder="Notas adicionales importantes..."
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
          disabled={loading || loadingMascotas}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Guardando...' : 'Iniciar Historia'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NuevaHistoriaClinicaModal;
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
  Tabs,
  Tab,
  Card,
  CardContent,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import {
  Pets,
  LocalHospital,
  MonitorHeart,
  Assignment,
} from '@mui/icons-material';
import medicalService from '../../services/medical.service';
import { Veterinario, Consulta } from '../../types/medical.types';

const Grid = (props: any) => <MuiGrid {...props} />;

interface NuevaConsultaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  historiaId: number | null;
}

interface ConsultaFormData {
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
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index} style={{ height: '100%' }}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

const NuevaConsultaModal: React.FC<NuevaConsultaModalProps> = ({ 
  open, 
  onClose, 
  onSuccess,
  historiaId 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [selectedVeterinario, setSelectedVeterinario] = useState<Veterinario | null>(null);
  const [fechaConsulta, setFechaConsulta] = useState<Date | null>(new Date());
  const [horaConsulta, setHoraConsulta] = useState<Date | null>(new Date());
  const [proximaCita, setProximaCita] = useState<Date | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const [formData, setFormData] = useState<Partial<ConsultaFormData>>({
    motivo_consulta: '',
    temperatura: undefined,
    peso: undefined,
    pulso: undefined,
    respiracion: undefined,
    diagnostico: '',
    tratamiento_ideal: '',
    tratamiento_instaurado: '',
    pronostico: '',
    costo_consulta: undefined,
    observaciones: '',
  });

  useEffect(() => {
    if (open) {
      loadVeterinarios();
      setTabValue(0);
    }
  }, [open]);

  const loadVeterinarios = async () => {
    try {
      const vets = await medicalService.getVeterinarios();
      setVeterinarios(vets.filter(v => v.activo));
    } catch (err) {
      console.error('Error al cargar veterinarios:', err);
      setError('Error al cargar veterinarios');
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  const validateBasicInfo = (): boolean => {
    if (!selectedVeterinario) {
      setError('Debe seleccionar un veterinario');
      setTabValue(0);
      return false;
    }
    if (!fechaConsulta || !horaConsulta) {
      setError('Debe seleccionar fecha y hora');
      setTabValue(0);
      return false;
    }
    if (!formData.motivo_consulta?.trim()) {
      setError('Debe ingresar el motivo de la consulta');
      setTabValue(0);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      setError(null);

      if (!validateBasicInfo()) {
        return;
      }

      setLoading(true);
    
      if (!historiaId) {
        setError('ID de historia clínica no válido');
        setLoading(false);
        return;
      }

      const consultaData: Partial<Consulta> = {
        historia_id: historiaId,
        veterinario_id: selectedVeterinario?.veterinario_id,
        fecha_consulta: fechaConsulta ?format(fechaConsulta, 'yyyy-MM-dd'): '',
        hora_consulta: horaConsulta ? format(horaConsulta, 'HH:mm') : '',
        motivo_consulta: formData.motivo_consulta!,
        temperatura: formData.temperatura,
        peso: formData.peso,
        pulso: formData.pulso,
        respiracion: formData.respiracion,
        diagnostico: formData.diagnostico,
        tratamiento_ideal: formData.tratamiento_ideal,
        tratamiento_instaurado: formData.tratamiento_instaurado,
        pronostico: formData.pronostico,
        costo_consulta: formData.costo_consulta,
        observaciones: formData.observaciones,
        proxima_cita: proximaCita ? format(proximaCita, 'yyyy-MM-dd') : undefined,
      };

      await medicalService.createConsulta(consultaData);
      
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Error al crear consulta:', err);
      setError(err.response?.data?.message || 'Error al crear la consulta');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      motivo_consulta: '',
      temperatura: undefined,
      peso: undefined,
      pulso: undefined,
      respiracion: undefined,
      diagnostico: '',
      tratamiento_ideal: '',
      tratamiento_instaurado: '',
      pronostico: '',
      costo_consulta: undefined,
      observaciones: '',
    });
    setSelectedVeterinario(null);
    setFechaConsulta(new Date());
    setHoraConsulta(new Date());
    setProximaCita(null);
    setError(null);
    setTabValue(0);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          Nueva Consulta
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete la información de la consulta
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ overflow: 'hidden' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          {/* Tabs Compactas */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ 
              mb: 2,
              minHeight: 48,
              '& .MuiTab-root': { 
                minHeight: 48,
                fontSize: '0.75rem',
                py: 1
              }
            }}
          >
            <Tab 
              icon={<Pets fontSize="small" />} 
              label="Básica" 
              iconPosition="start"
            />
            <Tab 
              icon={<MonitorHeart fontSize="small" />} 
              label="Signos" 
              iconPosition="start"
            />
            <Tab 
              icon={<LocalHospital fontSize="small" />} 
              label="Diagnóstico" 
              iconPosition="start"
            />
            <Tab 
              icon={<Assignment fontSize="small" />} 
              label="Adicional" 
              iconPosition="start"
            />
          </Tabs>

          {/* Contenido de las Tabs */}
          <Box sx={{ height: 400, overflow: 'auto' }}>
            {/* Tab 1: Información Básica */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Autocomplete
                        size="small"
                        options={veterinarios}
                        getOptionLabel={(option) => `${option.nombre} ${option.apellidos}`}
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
                            label="Veterinario *"
                            placeholder="Seleccionar veterinario..."
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

                <Grid item xs={12} sm={6}>
                    <DatePicker
                        label="Fecha *"
                        value={fechaConsulta}
                        onChange={(newValue) => setFechaConsulta(newValue)}
                        slotProps={{
                        textField: {
                            size: 'small',
                            fullWidth: true,
                        },
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TimePicker
                        label="Hora *"
                        value={horaConsulta}
                        onChange={(newValue) => setHoraConsulta(newValue)}
                        ampm={false}
                        slotProps={{
                        textField: {
                            size: 'small',
                            fullWidth: true,
                        },
                        }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        size="small"
                        fullWidth
                        label="Motivo de consulta *"
                        value={formData.motivo_consulta}
                        onChange={(e) => setFormData({ ...formData, motivo_consulta: e.target.value })}
                        placeholder="Describa el motivo principal..."
                        multiline
                        sx={{
                            '& .MuiOutlinedInput-root': {
                            maxHeight: '90vh',
                            width: '45vw',  // Ocupa 45% del ancho de la ventana
                            maxWidth: 800   // Ancho máximo en pixels
                            },
                        }}
                        rows={3}
                    />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 2: Signos Vitales */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={2}>
                {[
                  { label: 'Temperatura', value: formData.temperatura, unit: '°C', field: 'temperatura', step: 0.1 },
                  { label: 'Peso', value: formData.peso, unit: 'kg', field: 'peso', step: 0.1 },
                  { label: 'Pulso', value: formData.pulso, unit: 'lpm', field: 'pulso' },
                  { label: 'Respiración', value: formData.respiracion, unit: 'rpm', field: 'respiracion' },
                ].map((item) => (
                  <Grid item xs={12} sm={6} key={item.field}>
                    <Card variant="outlined" sx={{ background: '#f8f9fa' }}>
                      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          {item.label}
                        </Typography>
                        <TextField
                          size="small"
                          fullWidth
                          type="number"
                          value={item.value || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            [item.field]: e.target.value ? 
                              (item.step ? parseFloat(e.target.value) : parseInt(e.target.value)) : 
                              undefined 
                          })}
                          slotProps={{
                            input: {
                              sx: { textAlign: 'center', fontWeight: 'bold' },
                              endAdornment: <InputAdornment position="end">{item.unit}</InputAdornment>,
                            },
                          }}
                          inputProps={{ step: item.step || 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            {/* Tab 3: Diagnóstico y Tratamiento */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Diagnóstico"
                    value={formData.diagnostico}
                    onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                    multiline
                    rows={3}
                    placeholder="Describa el diagnóstico..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Pronóstico"
                    value={formData.pronostico}
                    onChange={(e) => setFormData({ ...formData, pronostico: e.target.value })}
                    multiline
                    rows={2}
                    placeholder="Describa el pronóstico..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Tratamiento Ideal"
                    value={formData.tratamiento_ideal}
                    onChange={(e) => setFormData({ ...formData, tratamiento_ideal: e.target.value })}
                    multiline
                    rows={2}
                    placeholder="Tratamiento ideal recomendado..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Tratamiento Instaurado"
                    value={formData.tratamiento_instaurado}
                    onChange={(e) => setFormData({ ...formData, tratamiento_instaurado: e.target.value })}
                    multiline
                    rows={2}
                    placeholder="Tratamiento que se aplicó..."
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 4: Información Adicional */}
            <TabPanel value={tabValue} index={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Costo de consulta"
                    type="number"
                    value={formData.costo_consulta || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      costo_consulta: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Próxima cita"
                    value={proximaCita}
                    onChange={(newValue) => setProximaCita(newValue)}
                    minDate={new Date()}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Observaciones"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    multiline
                    rows={3}
                    placeholder="Observaciones adicionales..."
                  />
                </Grid>
              </Grid>
            </TabPanel>
          </Box>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Guardando...' : 'Crear Consulta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NuevaConsultaModal;
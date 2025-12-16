// src/components/clinicals/DetalleHistoriaClinica.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid as MuiGrid,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Pets,
  LocalHospital,
  CalendarToday,
  Person,
  Phone,
  Home,
  Cake,
  FitnessCenter,
  Add,
  Visibility,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import medicalService from '../../services/medical.service';
import { HistoriaClinica, Consulta } from '../../types/medical.types';
import NuevaConsultaModal from './NuevaConsultaModal';
import SeguimientoModal from './SeguimientoModal';

const Grid = (props: any) => <MuiGrid {...props} />;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const DetalleHistoriaClinica: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [historia, setHistoria] = useState<HistoriaClinica | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [modalConsultaOpen, setModalConsultaOpen] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [modalSeguimientoOpen, setModalSeguimientoOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadHistoria();
      loadConsultas();
    }
  }, [id]);

  const loadHistoria = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await medicalService.getHistoria(parseInt(id!));
      setHistoria(data);
    } catch (err) {
      console.error('Error al cargar historia:', err);
      setError('Error al cargar la historia clínica');
    } finally {
      setLoading(false);
    }
  };

  const loadConsultas = async () => {
    try {
      const data = await medicalService.getConsultas({
        historia_id: parseInt(id!),
      });
      setConsultas(data.consultas);
    } catch (err) {
      console.error('Error al cargar consultas:', err);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleConsultaSuccess = () => {
    loadConsultas();
    setModalConsultaOpen(false);
  };

  const handleSeguimientoSuccess = () => {
    loadConsultas();
    setModalSeguimientoOpen(false);
    setSelectedConsulta(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!historia) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Historia clínica no encontrada
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/medical-records')}
          sx={{ mt: 2 }}
        >
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/medical-records')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Historia Clínica #{historia.historia_id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {historia.mascota?.nombre} - {historia.mascota?.especie}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setModalConsultaOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            Nueva Consulta
          </Button>
        </Box>
      </Box>

      {/* Info Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Mascota */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#9b59b6', width: 56, height: 56 }}>
                  <Pets sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {historia.mascota?.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {historia.mascota?.especie} • {historia.mascota?.raza || 'Sin raza'}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Cake fontSize="small" color="action" />
                  <Typography variant="body2">
                    {historia.mascota?.edad || 'Edad no registrada'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FitnessCenter fontSize="small" color="action" />
                  <Typography variant="body2">
                    Peso: {historia.peso_inicial || historia.mascota?.peso_actual || '-'} kg
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalHospital fontSize="small" color="action" />
                  <Typography variant="body2">
                    {historia.mascota?.esterilizado ? 'Esterilizado' : 'No esterilizado'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Propietario */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#3498db', width: 56, height: 56 }}>
                  <Person sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Propietario
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Información de contacto
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person fontSize="small" color="action" />
                  <Typography variant="body2">
                    {historia.mascota?.propietario?.nombre} {historia.mascota?.propietario?.apellidos}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2">
                    {historia.mascota?.propietario?.telefono}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Home fontSize="small" color="action" />
                  <Typography variant="body2">
                    {historia.mascota?.propietario?.direccion || 'No registrada'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Estadísticas */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea22 0%, #764ba211 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#667eea', width: 56, height: 56 }}>
                  <CalendarToday sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Estadísticas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Resumen de consultas
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="#667eea">
                    {consultas.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Consultas
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="#667eea">
                    {historia.activa ? '1' : '0'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Activa
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Información General" />
          <Tab label={`Consultas (${consultas.length})`} />
        </Tabs>

        {/* Tab 1: Información General */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3 }}>
            <Grid container spacing={3}>
            
            {/* Sección: Información Básica */}
            <Grid item xs={12}>
                <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalHospital fontSize="small" />
                    Información Básica
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                        Estado:
                        </Typography>
                        <Chip 
                        label={historia.activa ? "Activa" : "Inactiva"} 
                        color={historia.activa ? "success" : "default"}
                        size="small"
                        />
                    </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                        Peso Inicial:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                        {historia.peso_inicial ? `${historia.peso_inicial} kg` : 'No registrado'}
                        </Typography>
                    </Box>
                    </Grid>
                </Grid>
                </Paper>
            </Grid>

            {/* Sección: Anamnesis */}
            <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Pets fontSize="small" />
                    Anamnesis
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                            Queja Principal
                        </Typography>
                        <Typography variant="body2" sx={{ minHeight: '60px' }}>
                            {historia.queja_principal 
                              ? historia.queja_principal
                              : (
                                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                  No registrada
                                </Typography>
                              )
                            }
                        </Typography>
                        </CardContent>
                    </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                            Características Especiales
                        </Typography>
                        <Typography variant="body2" sx={{ minHeight: '60px' }}>
                            {historia.caracteristicas_especiales || 
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                No registradas
                            </Typography>
                            }
                        </Typography>
                        </CardContent>
                    </Card>
                    </Grid>
                </Grid>
                </Paper>
            </Grid>

            {/* Sección: Historial Médico */}
            <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalHospital fontSize="small" />
                    Historial Médico
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%', background: '#fffbf0' }}>
                        <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" color="#e67e22" gutterBottom>
                            Tratamientos Previos
                        </Typography>
                        <Typography variant="body2" sx={{ minHeight: '80px' }}>
                            {historia.tratamientos_previos || 
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                No registrados
                            </Typography>
                            }
                        </Typography>
                        </CardContent>
                    </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%', background: '#f0f8ff' }}>
                        <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" color="#2980b9" gutterBottom>
                            Enfermedades Anteriores
                        </Typography>
                        <Typography variant="body2" sx={{ minHeight: '80px' }}>
                            {historia.enfermedades_anteriores || 
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                No registradas
                            </Typography>
                            }
                        </Typography>
                        </CardContent>
                    </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%', background: '#f8f0ff' }}>
                        <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" color="#9b59b6" gutterBottom>
                            Cirugías Anteriores
                        </Typography>
                        <Typography variant="body2" sx={{ minHeight: '80px' }}>
                            {historia.cirugias_anteriores || 
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                No registradas
                            </Typography>
                            }
                        </Typography>
                        </CardContent>
                    </Card>
                    </Grid>
                </Grid>
                </Paper>
            </Grid>

            {/* Sección: Nutrición y Prevención */}
            <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FitnessCenter fontSize="small" />
                    Nutrición y Prevención
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Tipo de Dieta
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {historia.tipo_dieta || 
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                No especificado
                            </Typography>
                            }
                        </Typography>
                        </CardContent>
                    </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Detalle de Dieta
                        </Typography>
                        <Typography variant="body2" sx={{ minHeight: '60px' }}>
                            {historia.detalle_dieta || 
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                No especificado
                            </Typography>
                            }
                        </Typography>
                        </CardContent>
                    </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Medicina Preventiva
                        </Typography>
                        <Typography variant="body2" sx={{ minHeight: '60px' }}>
                            {historia.medicina_preventiva || 
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                No registrada
                            </Typography>
                            }
                        </Typography>
                        </CardContent>
                    </Card>
                    </Grid>
                </Grid>
                </Paper>
            </Grid>

            {/* Sección: Observaciones Generales */}
            <Grid item xs={12}>
                <Paper sx={{ p: 3, background: '#f8f9fa' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Edit fontSize="small" />
                    Observaciones Generales
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Card variant="outlined">
                    <CardContent>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {historia.observaciones_generales || 
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            No hay observaciones generales registradas
                        </Typography>
                        }
                    </Typography>
                    </CardContent>
                </Card>
                </Paper>
            </Grid>

            </Grid>
          </Box>
        </TabPanel>

        {/* Tab 2: Consultas */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            {consultas.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary" gutterBottom>
                  No hay consultas registradas
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setModalConsultaOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Agregar Primera Consulta
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Hora</TableCell>
                      <TableCell>Veterinario</TableCell>
                      <TableCell>Motivo</TableCell>
                      <TableCell>Diagnóstico</TableCell>
                      <TableCell>Peso</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {consultas.map((consulta) => (
                      <TableRow key={consulta.consulta_id} hover>
                        <TableCell>
                          {format(parseISO(consulta.fecha_consulta), "d 'de' MMMM, yyyy", { locale: es })}
                        </TableCell>
                        <TableCell>{consulta.hora_consulta}</TableCell>
                        <TableCell>
                          Dr. {consulta.veterinario?.nombre} {consulta.veterinario?.apellidos}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {consulta.motivo_consulta}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {consulta.diagnostico || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {consulta.peso ? `${consulta.peso} kg` : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver detalles">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => navigate(`/medical-records/consultation/${consulta.consulta_id}`)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Agregar seguimiento">
                            <IconButton 
                              size="small" 
                              color="secondary"
                              onClick={() => {
                                setSelectedConsulta(consulta);
                                setModalSeguimientoOpen(true);
                              }}
                            >
                              <Add />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Modal Nueva Consulta */}
      <NuevaConsultaModal
        open={modalConsultaOpen}
        onClose={() => setModalConsultaOpen(false)}
        onSuccess={handleConsultaSuccess}
        historiaId={historia.historia_id}
      />

      {/* Modal Seguimiento */}
      <SeguimientoModal
        open={modalSeguimientoOpen}
        onClose={() => {
          setModalSeguimientoOpen(false);
          setSelectedConsulta(null);
        }}
        onSuccess={handleSeguimientoSuccess}
        consultaId={selectedConsulta?.consulta_id}
      />
    </Box>
  );
};

export default DetalleHistoriaClinica;
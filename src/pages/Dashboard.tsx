import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Grid as MuiGrid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  People,
  Pets,
  EventNote,
  Inventory,
  TrendingUp,
  Warning,
  CheckCircle,
  AccessTime,
  MoreVert,
  CalendarToday,
  LocalHospital,
  AttachMoney,
  Cancel,
  HourglassEmpty,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import appointmentService from '../services/appointment.service';
import clientService from '../services/client.service';
import petService from '../services/pet.service';
import { Cita } from '../types/appointment.types';
import { useNavigate } from 'react-router-dom';
import NuevaCitaModal from '../components/appointments/NuevaCitaModal';
import NuevaMascotaModal from '../components/pets/NuevaMascotaModal';
import NuevoClienteModal from '../components/clients/NuevoClienteModal';
import NuevaConsultaModal from '@/components/clinicals/NuevaConsultaModal';
import NuevaHistoriaClinicaModal from '@/components/clinicals/NuevaHistoriaClinicaModal';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: number;
  loading?: boolean;
}

const Grid = (props: any) => <MuiGrid {...props} />;

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, change, loading }) => (
  <Card
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
      borderTop: `3px solid ${color}`,
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={80} height={40} />
          ) : (
            <>
              <Typography variant="h4" component="div" fontWeight="bold" sx={{ color }}>
                {value}
              </Typography>
              {change !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUp sx={{ fontSize: 16, color: change > 0 ? '#2ecc71' : '#e74c3c' }} />
                  <Typography
                    variant="caption"
                    sx={{ ml: 0.5, color: change > 0 ? '#2ecc71' : '#e74c3c' }}
                  >
                    {change > 0 ? '+' : ''}{change}% este mes
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [stats, setStats] = useState({
    clientesActivos: 0,
    mascotasRegistradas: 0,
    citasHoy: 0,
    productosPorVencer: 12, // Este se mantiene hasta que tengas el servicio de inventario
    ventasMes: 0,
    citasPendientes: 0,
  });

  const [citasHoy, setCitasHoy] = useState<Cita[]>([]);
  const [citasProximas, setCitasProximas] = useState<Cita[]>([]);

  const [alertas, setAlertas] = useState<Array<{
    tipo: string;
    mensaje: string;
    icon: React.ReactNode;
  }>>([]);

  // Estados para los modales
  const [modalCitaOpen, setModalCitaOpen] = useState(false);
  const [modalMascotaOpen, setModalMascotaOpen] = useState(false);
  const [modalClienteOpen, setModalClienteOpen] = useState(false);
  const [modalHistoriaOpen, setModalHistoriaOpen] = useState(false);
  const [historiaId, setHistoriaId] = useState<number | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos en paralelo para mejorar performance
      const [
        clientesResponse,
        mascotasResponse,
        citasHoyResponse,
        citasProximasResponse,
        citasDelMes,
      ] = await Promise.all([
        clientService.getClientes({ activo: true, per_page: 1 }),
        petService.getMascotas({ activo: true, per_page: 1 }),
        appointmentService.getCitasHoy(),
        appointmentService.getCitasProximas(),
        appointmentService.getCitas({
          fecha_desde: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
          fecha_hasta: format(new Date(), 'yyyy-MM-dd'),
        }),
      ]);

      // Actualizar estadísticas
      setStats({
        clientesActivos: clientesResponse.pagination.total,
        mascotasRegistradas: mascotasResponse.pagination.total,
        citasHoy: citasHoyResponse.length,
        productosPorVencer: 12, // Mantener hasta implementar inventario
        ventasMes: 0, // Mantener hasta implementar facturación
        citasPendientes: citasDelMes.citas.filter(c => 
          c.estado === 'Programada' || c.estado === 'Confirmada'
        ).length,
      });

      // Actualizar citas de hoy
      setCitasHoy(citasHoyResponse);

      // Actualizar citas próximas
      setCitasProximas(citasProximasResponse);

      // Generar alertas dinámicas
      const nuevasAlertas = [];

      // Alerta de citas pendientes de hoy
      const citasPendientesHoy = citasHoyResponse.filter(c => 
        c.estado === 'Programada'
      ).length;
      
      if (citasPendientesHoy > 0) {
        nuevasAlertas.push({
          tipo: 'cita',
          mensaje: `${citasPendientesHoy} cita${citasPendientesHoy > 1 ? 's' : ''} pendiente${citasPendientesHoy > 1 ? 's' : ''} de confirmar hoy`,
          icon: <EventNote />
        });
      }

      // Alerta de citas próximas sin confirmar
      const citasSinConfirmar = citasProximasResponse.filter(c => 
        c.estado === 'Programada'
      ).length;

      if (citasSinConfirmar > 0) {
        nuevasAlertas.push({
          tipo: 'cita',
          mensaje: `${citasSinConfirmar} cita${citasSinConfirmar > 1 ? 's' : ''} próxima${citasSinConfirmar > 1 ? 's' : ''} sin confirmar`,
          icon: <EventNote />
        });
      }

      // Mantener alertas de inventario y pagos (hasta implementar esos módulos)
      nuevasAlertas.push(
        { tipo: 'inventario', mensaje: '3 productos con stock bajo', icon: <Inventory /> },
        { tipo: 'pago', mensaje: '8 facturas pendientes de pago', icon: <AttachMoney /> }
      );

      setAlertas(nuevasAlertas);

    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setError('Error al cargar los datos del dashboard. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoChip = (estado: string) => {
    const configs: Record<string, { label: string; color: any; icon: React.ReactNode }> = {
      'Programada': { label: 'Programada', color: 'warning', icon: <HourglassEmpty fontSize="small" /> },
      'Confirmada': { label: 'Confirmada', color: 'success', icon: <CheckCircle fontSize="small" /> },
      'En curso': { label: 'En Curso', color: 'info', icon: <AccessTime fontSize="small" /> },
      'Completada': { label: 'Completada', color: 'success', icon: <CheckCircle fontSize="small" /> },
      'Cancelada': { label: 'Cancelada', color: 'error', icon: <Cancel fontSize="small" /> },
      'No asistió': { label: 'No Asistió', color: 'error', icon: <Warning fontSize="small" /> },
    };

    const config = configs[estado] || configs['Programada'];

    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 500 }}
      />
    );
  };

  const handleCitaAction = async (citaId: number, action: 'confirmar' | 'cancelar' | 'completar') => {
    try {
      if (action === 'confirmar') {
        await appointmentService.confirmarCita(citaId);
      } else if (action === 'cancelar') {
        await appointmentService.cancelarCita(citaId);
      } else if (action === 'completar') {
        await appointmentService.completarCita(citaId);
      }
      
      // Recargar datos
      loadDashboardData();
    } catch (err) {
      console.error(`Error al ${action} cita:`, err);
      setError(`Error al ${action} la cita. Por favor, intenta de nuevo.`);
    }
  };

  const handleModalSuccess = () => {
    // Recargar todos los datos del dashboard
    loadDashboardData();
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Bienvenido, {user?.nombre}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Clientes Activos"
            value={stats.clientesActivos}
            icon={<People />}
            color="#3498db"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Mascotas Registradas"
            value={stats.mascotasRegistradas}
            icon={<Pets />}
            color="#9b59b6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Citas Hoy"
            value={stats.citasHoy}
            icon={<EventNote />}
            color="#2ecc71"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Citas Pendientes"
            value={stats.citasPendientes}
            icon={<Warning />}
            color="#f39c12"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Citas del Día */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Citas de Hoy
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<CalendarToday />}
                onClick={() => navigate('/citas')}
              >
                Ver Calendario
              </Button>
            </Box>
            
            {citasHoy.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No hay citas programadas para hoy
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Hora</TableCell>
                      <TableCell>Mascota</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Motivo</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {citasHoy.map((cita) => (
                      <TableRow key={cita.cita_id} hover>
                        <TableCell>{cita.hora_cita}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {cita.mascota?.nombre}
                            <Typography variant="caption" color="text.secondary">
                              ({cita.mascota?.especie})
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {cita.cliente?.nombre} {cita.cliente?.apellidos}
                        </TableCell>
                        <TableCell>{cita.motivo}</TableCell>
                        <TableCell>{getEstadoChip(cita.estado)}</TableCell>
                        <TableCell>
                          <IconButton 
                            size="small"
                            onClick={() => navigate(`/citas/${cita.cita_id}`)}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Alertas y Notificaciones */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Alertas y Notificaciones
            </Typography>
            <List>
              {alertas.map((alerta, index) => (
                <ListItem
                  key={index}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: alerta.tipo === 'vacuna' ? '#3498db' :
                                alerta.tipo === 'inventario' ? '#e74c3c' :
                                alerta.tipo === 'cita' ? '#f39c12' : '#9b59b6',
                        width: 36,
                        height: 36,
                      }}
                    >
                      {alerta.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={alerta.mensaje}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Próximas Citas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Próximas Citas
            </Typography>
            {citasProximas.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No hay citas próximas programadas
                </Typography>
              </Box>
            ) : (
              <List>
                {citasProximas.slice(0, 5).map((cita) => (
                  <ListItem
                    key={cita.cita_id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => navigate(`/citas/${cita.cita_id}`)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#3498db' }}>
                        <CalendarToday />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${cita.mascota?.nombre} - ${cita.cliente?.nombre}`}
                      secondary={`${format(parseISO(cita.fecha_cita), "d 'de' MMMM", { locale: es })} a las ${cita.hora_cita}`}
                    />
                    {getEstadoChip(cita.estado)}
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Acciones Rápidas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Acciones Rápidas
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<EventNote />}
                  onClick={() => setModalCitaOpen(true)}
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2980b9 0%, #21618c 100%)',
                    },
                  }}
                >
                  Nueva Cita
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Pets />}
                  onClick={() => setModalMascotaOpen(true)}
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
                    },
                  }}
                >
                  Nueva Mascota
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<People />}
                  onClick={() => setModalClienteOpen(true)}
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
                    },
                  }}
                >
                  Nuevo Cliente
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<LocalHospital />}
                  onClick={() => setModalHistoriaOpen(true)}  // ← Cambia a esto
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8e44ad 0%, #7d3c98 100%)',
                    },
                  }}
                >
                  Nueva Historia
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Modales */}
      <NuevaCitaModal
        open={modalCitaOpen}
        onClose={() => setModalCitaOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <NuevaMascotaModal
        open={modalMascotaOpen}
        onClose={() => setModalMascotaOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <NuevoClienteModal
        open={modalClienteOpen}
        onClose={() => setModalClienteOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <NuevaHistoriaClinicaModal
        open={modalHistoriaOpen}
        onClose={() => setModalHistoriaOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </Box>
  );
};

export default Dashboard;
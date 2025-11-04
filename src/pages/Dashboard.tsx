// src/pages/Dashboard.tsx
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
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: number;
}
const Grid = (props: any) => <MuiGrid {...props} />;
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, change }) => (
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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clientesActivos: 156,
    mascotasRegistradas: 289,
    citasHoy: 23,
    productosPorVencer: 12,
    ventasMes: 2450000,
    citasPendientes: 5,
  });

  const [citasHoy, setCitasHoy] = useState([
    {
      id: 1,
      hora: '09:00',
      mascota: 'Max',
      tipo: 'Perro',
      cliente: 'Juan Pérez',
      motivo: 'Vacunación',
      estado: 'pendiente',
    },
    {
      id: 2,
      hora: '10:30',
      mascota: 'Luna',
      tipo: 'Gato',
      cliente: 'María García',
      motivo: 'Consulta General',
      estado: 'en_progreso',
    },
    {
      id: 3,
      hora: '11:00',
      mascota: 'Rocky',
      tipo: 'Perro',
      cliente: 'Carlos López',
      motivo: 'Control',
      estado: 'pendiente',
    },
    {
      id: 4,
      hora: '14:00',
      mascota: 'Michi',
      tipo: 'Gato',
      cliente: 'Ana Rodríguez',
      motivo: 'Cirugía',
      estado: 'confirmado',
    },
  ]);

  const [alertas] = useState([
    { tipo: 'vacuna', mensaje: '5 mascotas necesitan vacunación esta semana', icon: <LocalHospital /> },
    { tipo: 'inventario', mensaje: '3 productos con stock bajo', icon: <Inventory /> },
    { tipo: 'cita', mensaje: '2 citas sin confirmar para mañana', icon: <EventNote /> },
    { tipo: 'pago', mensaje: '8 facturas pendientes de pago', icon: <AttachMoney /> },
  ]);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const getEstadoChip = (estado: string) => {
    const configs: Record<string, { label: string; color: any; icon: React.ReactNode }> = {
      pendiente: { label: 'Pendiente', color: 'warning', icon: <AccessTime fontSize="small" /> },
      en_progreso: { label: 'En Progreso', color: 'info', icon: <AccessTime fontSize="small" /> },
      confirmado: { label: 'Confirmado', color: 'success', icon: <CheckCircle fontSize="small" /> },
      cancelado: { label: 'Cancelado', color: 'error', icon: <Warning fontSize="small" /> },
    };

    const config = configs[estado] || configs.pendiente;

    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        icon={config.icon}
        sx={{ fontWeight: 500 }}
      />
    );
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
            change={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Mascotas Registradas"
            value={stats.mascotasRegistradas}
            icon={<Pets />}
            color="#9b59b6"
            change={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Citas Hoy"
            value={stats.citasHoy}
            icon={<EventNote />}
            color="#2ecc71"
            change={-5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Productos por Vencer"
            value={stats.productosPorVencer}
            icon={<Warning />}
            color="#e74c3c"
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
              <Button variant="outlined" size="small" startIcon={<CalendarToday />}>
                Ver Calendario
              </Button>
            </Box>
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
                    <TableRow key={cita.id} hover>
                      <TableCell>{cita.hora}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {cita.mascota}
                          <Typography variant="caption" color="text.secondary">
                            ({cita.tipo})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{cita.cliente}</TableCell>
                      <TableCell>{cita.motivo}</TableCell>
                      <TableCell>{getEstadoChip(cita.estado)}</TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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

        {/* Resumen Financiero */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Resumen Financiero del Mes
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Ventas Totales
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  ${stats.ventasMes.toLocaleString('es-CO')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Facturas Emitidas
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  89
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Ticket Promedio
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  $27.500
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Facturas Pendientes
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  {stats.citasPendientes}
                </Typography>
              </Box>
            </Box>
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
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8e44ad 0%, #7d3c98 100%)',
                    },
                  }}
                >
                  Historia Clínica
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
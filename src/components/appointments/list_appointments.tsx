import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid as MuiGrid,
  MenuItem,
  Typography,
  Tooltip,
  Alert,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  Person,
  Phone,
  Email,
  LocationOn,
  Badge,
  Pets,
  Close,
  Save,
  FilterList,
  CalendarToday,
  Schedule,
  Cancel,
  CheckCircle,
  PlayCircle,
  Done,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { Cita, CitaFormData, CitaFilters } from '@/types/appointment.types';
import appointmentService from '@/services/appointment.service';
import petService from '@/services/pet.service';
import clientService from '@/services/client.service';
import { Cliente } from '@/types/client.types';
import medicalService from '@/services/medical.service';
import { Mascota } from '@/types/pet.types';
import { Veterinario } from '@/types/medical.types';

const Grid = (props: any) => <MuiGrid {...props} />;

const Appointments: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filtros
  const [filters, setFilters] = useState<CitaFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  
  // Data para formularios
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  
  // Form data
  const [formData, setFormData] = useState<CitaFormData>({
    cliente_id: 0,
    mascota_id: 0,
    veterinario_id: undefined,
    fecha_cita: '',
    hora_cita: '',
    motivo: '',
    observaciones: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CitaFormData, string>>>({});

  // Estados para disponibilidad
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [checkingDisponibilidad, setCheckingDisponibilidad] = useState(false);

  useEffect(() => {
    fetchCitas();
    fetchVeterinarios();
    fetchClientes();
  }, [page, rowsPerPage, searchTerm, filters]);

  const fetchCitas = async () => {
    setLoading(true);
    try {
      const response = await appointmentService.getCitas({
        page: page + 1,
        per_page: rowsPerPage,
        ...filters,
      });
      setCitas(response.citas);
      setTotalCount(response.pagination.total);
    } catch (error) {
      toast.error('Error al cargar citas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVeterinarios = async () => {
    try {
      const data = await medicalService.getVeterinarios();
      setVeterinarios(data);
    } catch (error) {
      console.error('Error al cargar veterinarios:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await clientService.getClientes({ activo: true });
      setClientes(response.clientes);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const fetchMascotasByCliente = async (clienteId: number) => {
    try {
      const data = await petService.getMascotasByCliente(clienteId);
      setMascotas(data);
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
      setMascotas([]);
    }
  };

  const checkDisponibilidad = async (fecha: string, veterinarioId?: number) => {
    if (!fecha) return;
    
    setCheckingDisponibilidad(true);
    try {
      const disponibilidad = await appointmentService.checkDisponibilidad(fecha, veterinarioId);
      setHorariosDisponibles(disponibilidad.horarios_disponibles);
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      setHorariosDisponibles([]);
    } finally {
      setCheckingDisponibilidad(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (key: keyof CitaFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenForm = (cita?: Cita) => {
    if (cita) {
      setEditMode(true);
      setSelectedCita(cita);
      setFormData({
        cliente_id: cita.cliente_id,
        mascota_id: cita.mascota_id,
        veterinario_id: cita.veterinario_id,
        fecha_cita: cita.fecha_cita,
        hora_cita: cita.hora_cita,
        motivo: cita.motivo,
        observaciones: cita.observaciones || '',
      });
      // Cargar mascotas del cliente
      fetchMascotasByCliente(cita.cliente_id);
      // Verificar disponibilidad
      checkDisponibilidad(cita.fecha_cita, cita.veterinario_id);
    } else {
      setEditMode(false);
      setSelectedCita(null);
      setFormData({
        cliente_id: 0,
        mascota_id: 0,
        veterinario_id: undefined,
        fecha_cita: '',
        hora_cita: '',
        motivo: '',
        observaciones: '',
      });
      setMascotas([]);
      setHorariosDisponibles([]);
    }
    setFormErrors({});
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setFormData({
      cliente_id: 0,
      mascota_id: 0,
      veterinario_id: undefined,
      fecha_cita: '',
      hora_cita: '',
      motivo: '',
      observaciones: '',
    });
    setFormErrors({});
    setMascotas([]);
    setHorariosDisponibles([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (name: keyof CitaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));

    // Si cambia el cliente, cargar sus mascotas
    if (name === 'cliente_id' && value) {
      fetchMascotasByCliente(value);
      setFormData(prev => ({ ...prev, mascota_id: 0 }));
    }

    // Si cambia la fecha o veterinario, verificar disponibilidad
    if (name === 'fecha_cita' || name === 'veterinario_id') {
      const fecha = name === 'fecha_cita' ? value : formData.fecha_cita;
      const vetId = name === 'veterinario_id' ? value : formData.veterinario_id;
      
      if (fecha) {
        checkDisponibilidad(fecha, vetId);
        // Reset hora si se cambia fecha o veterinario
        setFormData(prev => ({ ...prev, hora_cita: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CitaFormData, string>> = {};

    if (!formData.cliente_id) errors.cliente_id = 'El cliente es requerido';
    if (!formData.mascota_id) errors.mascota_id = 'La mascota es requerida';
    if (!formData.fecha_cita) errors.fecha_cita = 'La fecha es requerida';
    if (!formData.hora_cita) errors.hora_cita = 'La hora es requerida';
    if (!formData.motivo) errors.motivo = 'El motivo es requerido';
    if (formData.motivo && formData.motivo.length < 5) {
      errors.motivo = 'El motivo debe tener al menos 5 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editMode && selectedCita) {
        const updatedCita = await appointmentService.updateCita(selectedCita.cita_id, formData);
        setCitas(prevCitas => 
          prevCitas.map(cita => 
            cita.cita_id === selectedCita.cita_id ? updatedCita : cita
          )
        );
        toast.success('Cita actualizada correctamente');
      } else {
        const newCita = await appointmentService.createCita(formData);
        setCitas(prevCitas => [newCita, ...prevCitas]);
        toast.success('Cita creada correctamente');
      }
      handleCloseForm();
      fetchCitas();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar cita');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (cita: Cita) => {
    setLoading(true);
    try {
      const citaCompleta = await appointmentService.getCita(cita.cita_id);
      setSelectedCita(citaCompleta);
      setOpenView(true);
    } catch (error) {
      toast.error('Error al cargar información de la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (cita: Cita, action: 'confirmar' | 'cancelar' | 'completar') => {
    try {
      let updatedCita: Cita;
      
      switch (action) {
        case 'confirmar':
          updatedCita = await appointmentService.confirmarCita(cita.cita_id);
          toast.success('Cita confirmada correctamente');
          break;
        case 'cancelar':
          if (!window.confirm(`¿Está seguro de cancelar la cita del ${cita.fecha_cita} a las ${cita.hora_cita}?`)) {
            return;
          }
          updatedCita = await appointmentService.cancelarCita(cita.cita_id);
          toast.success('Cita cancelada correctamente');
          break;
        case 'completar':
          updatedCita = await appointmentService.completarCita(cita.cita_id);
          toast.success('Cita marcada como completada');
          break;
        default:
          return;
      }

      setCitas(prevCitas => 
        prevCitas.map(c => c.cita_id === cita.cita_id ? updatedCita : c)
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Error al ${action} cita`);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Programada': return 'default';
      case 'Confirmada': return 'primary';
      case 'En curso': return 'secondary';
      case 'Completada': return 'success';
      case 'Cancelada': return 'error';
      case 'No asistió': return 'warning';
      default: return 'default';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Programada': return <CalendarToday />;
      case 'Confirmada': return <CheckCircle />;
      case 'En curso': return <PlayCircle />;
      case 'Completada': return <Done />;
      case 'Cancelada': return <Cancel />;
      case 'No asistió': return <Cancel />;
      default: return <CalendarToday />;
    }
  };

  const getVeterinarioNombre = (veterinarioId: string) => {
    if (!veterinarioId) return "Todos los veterinarios";
    const vet = veterinarios.find(v => v.veterinario_id === parseInt(veterinarioId));
    return vet ? `${vet.nombre} ${vet.apellidos}` : "Todos los veterinarios";
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Gestión de Citas
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenForm()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            Nueva Cita
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Fecha desde"
                type="date"
                value={filters.fecha_desde || ''}
                onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Fecha hasta"
                type="date"
                value={filters.fecha_hasta || ''}
                onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Estado"
                value={filters.estado || ""}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                  select: {
                    displayEmpty: true,
                    renderValue: (value: any) => value === "" ? "Todos los estados" : value
                  }
                }}
              >
                <MenuItem value="">Todos los estados</MenuItem>
                <MenuItem value="Programada">Programada</MenuItem>
                <MenuItem value="Confirmada">Confirmada</MenuItem>
                <MenuItem value="En curso">En curso</MenuItem>
                <MenuItem value="Completada">Completada</MenuItem>
                <MenuItem value="Cancelada">Cancelada</MenuItem>
                <MenuItem value="No asistió">No asistió</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Veterinario"
                value={filters.veterinario_id || ""}
                onChange={(e) => handleFilterChange('veterinario_id', e.target.value)}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                  select: {
                    displayEmpty: true,
                    renderValue: (value: any) => value === "" ? "Todos los veterinarios" : getVeterinarioNombre(value)
                  }
                }}
              >
                <MenuItem value="">Todos los veterinarios</MenuItem>
                {veterinarios.map((vet) => (
                  <MenuItem key={vet.veterinario_id} value={vet.veterinario_id}>
                    {vet.nombre} {vet.apellidos}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar por motivo, observaciones..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha y Hora</TableCell>
                  <TableCell>Cliente y Mascota</TableCell>
                  <TableCell>Veterinario</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {citas.map((cita) => (
                  <TableRow key={cita.cita_id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {new Date(cita.fecha_cita).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cita.hora_cita}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {cita.cliente?.nombre} {cita.cliente?.apellidos}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cita.mascota?.nombre} ({cita.mascota?.especie})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {cita.veterinario ? (
                        <Typography variant="body2">
                          {cita.veterinario.nombre} {cita.veterinario.apellidos}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No asignado
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {cita.motivo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getEstadoIcon(cita.estado)}
                        label={cita.estado}
                        color={getEstadoColor(cita.estado) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" onClick={() => handleView(cita)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenForm(cita)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      
                      {cita.estado === 'Programada' && (
                        <Tooltip title="Confirmar">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleStatusChange(cita, 'confirmar')}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {['Programada', 'Confirmada', 'En curso'].includes(cita.estado) && (
                        <Tooltip title="Cancelar">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleStatusChange(cita, 'cancelar')}
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {['Confirmada', 'En curso'].includes(cita.estado) && (
                        <Tooltip title="Completar">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleStatusChange(cita, 'completar')}
                          >
                            <Done />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {citas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No se encontraron citas
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
            />
          </>
        )}
      </TableContainer>

      {/* Dialog Formulario */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {editMode ? 'Editar Cita' : 'Nueva Cita'}
            </Typography>
            <IconButton onClick={handleCloseForm} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.cliente_id}>
                <InputLabel>Cliente *</InputLabel>
                <Select
                  value={formData.cliente_id}
                  label="Cliente *"
                  onChange={(e) => handleSelectChange('cliente_id', e.target.value)}
                >
                  <MenuItem value={0}>Seleccionar cliente</MenuItem>
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.cliente_id} value={cliente.cliente_id}>
                      {cliente.nombre} {cliente.apellidos} - {cliente.documento_identidad}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.cliente_id && (
                  <Typography variant="caption" color="error">
                    {formErrors.cliente_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.mascota_id}>
                <InputLabel>Mascota *</InputLabel>
                <Select
                  value={formData.mascota_id}
                  label="Mascota *"
                  onChange={(e) => handleSelectChange('mascota_id', e.target.value)}
                  disabled={!formData.cliente_id || mascotas.length === 0}
                >
                  <MenuItem value={0}>Seleccionar mascota</MenuItem>
                  {mascotas.map((mascota) => (
                    <MenuItem key={mascota.mascota_id} value={mascota.mascota_id}>
                      {mascota.nombre} ({mascota.especie})
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.mascota_id && (
                  <Typography variant="caption" color="error">
                    {formErrors.mascota_id}
                  </Typography>
                )}
                {formData.cliente_id && mascotas.length === 0 && (
                  <Typography variant="caption" color="text.secondary">
                    El cliente no tiene mascotas registradas
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Veterinario</InputLabel>
                <Select
                  value={formData.veterinario_id || ''}
                  label="Veterinario"
                  onChange={(e) => handleSelectChange('veterinario_id', e.target.value || undefined)}
                >
                  <MenuItem value="">Sin asignar</MenuItem>
                  {veterinarios.map((vet) => (
                    <MenuItem key={vet.veterinario_id} value={vet.veterinario_id}>
                      {vet.nombre} {vet.apellidos}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de cita *"
                type="date"
                name="fecha_cita"
                value={formData.fecha_cita}
                onChange={handleInputChange}
                error={!!formErrors.fecha_cita}
                helperText={formErrors.fecha_cita}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.hora_cita}>
                <InputLabel>Hora de cita *</InputLabel>
                <Select
                  value={formData.hora_cita}
                  label="Hora de cita *"
                  onChange={(e) => handleSelectChange('hora_cita', e.target.value)}
                  disabled={!formData.fecha_cita || checkingDisponibilidad}
                >
                  <MenuItem value="">Seleccionar hora</MenuItem>
                  {horariosDisponibles.map((hora) => (
                    <MenuItem key={hora} value={hora}>
                      {hora}
                    </MenuItem>
                  ))}
                </Select>
                {checkingDisponibilidad && (
                  <Typography variant="caption" color="text.secondary">
                    Verificando disponibilidad...
                  </Typography>
                )}
                {formErrors.hora_cita && (
                  <Typography variant="caption" color="error">
                    {formErrors.hora_cita}
                  </Typography>
                )}
                {formData.fecha_cita && horariosDisponibles.length === 0 && !checkingDisponibilidad && (
                  <Typography variant="caption" color="warning.main">
                    No hay horarios disponibles para esta fecha
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motivo *"
                name="motivo"
                value={formData.motivo}
                onChange={handleInputChange}
                error={!!formErrors.motivo}
                helperText={formErrors.motivo || 'Mínimo 5 caracteres'}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          >
            {editMode ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Vista */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Detalles de la Cita</Typography>
            <IconButton onClick={() => setOpenView(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedCita && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 60, height: 60, bgcolor: '#667eea' }}>
                          <CalendarToday />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            Cita #{selectedCita.cita_id}
                          </Typography>
                          <Chip
                            icon={getEstadoIcon(selectedCita.estado)}
                            label={selectedCita.estado}
                            color={getEstadoColor(selectedCita.estado) as any}
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="h6">
                          {new Date(selectedCita.fecha_cita).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {selectedCita.hora_cita}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={3}>
                      {/* Información del Cliente */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person /> Información del Cliente
                        </Typography>
                        {selectedCita.cliente && (
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedCita.cliente.nombre} {selectedCita.cliente.apellidos}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Documento: {selectedCita.cliente.documento_identidad}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Teléfono: {selectedCita.cliente.telefono}
                            </Typography>
                            {selectedCita.cliente.email && (
                              <Typography variant="body2" color="text.secondary">
                                Email: {selectedCita.cliente.email}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Grid>

                      {/* Información de la Mascota */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Pets /> Información de la Mascota
                        </Typography>
                        {selectedCita.mascota && (
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedCita.mascota.nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Especie: {selectedCita.mascota.especie}
                            </Typography>
                            {selectedCita.mascota.raza && (
                              <Typography variant="body2" color="text.secondary">
                                Raza: {selectedCita.mascota.raza}
                              </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                              Sexo: {selectedCita.mascota.sexo}
                            </Typography>
                          </Box>
                        )}
                      </Grid>

                      {/* Información del Veterinario */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Badge /> Veterinario
                        </Typography>
                        {selectedCita.veterinario ? (
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedCita.veterinario.nombre} {selectedCita.veterinario.apellidos}
                            </Typography>
                            {selectedCita.veterinario.telefono && (
                              <Typography variant="body2" color="text.secondary">
                                Teléfono: {selectedCita.veterinario.telefono}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No asignado
                          </Typography>
                        )}
                      </Grid>

                      {/* Motivo y Observaciones */}
                      <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                          Motivo de la consulta
                        </Typography>
                        <Typography variant="body1">
                          {selectedCita.motivo}
                        </Typography>
                      </Grid>

                      {selectedCita.observaciones && (
                        <Grid item xs={12}>
                          <Typography variant="h6" gutterBottom>
                            Observaciones
                          </Typography>
                          <Typography variant="body1">
                            {selectedCita.observaciones}
                          </Typography>
                        </Grid>
                      )}

                      {/* Información adicional */}
                      <Grid item xs={12}>
                        <Divider />
                        <Typography variant="caption" color="text.secondary">
                          Creado el: {new Date(selectedCita.fecha_creacion).toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Appointments;
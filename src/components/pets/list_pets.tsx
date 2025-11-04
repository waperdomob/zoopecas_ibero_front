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
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  Pets as PetsIcon,
  CalendarMonth,
  Scale,
  Badge,
  LocalHospital,
  Close,
  Save,
  Person,
  FilterList,
  Male,
  Female,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { toast } from 'react-hot-toast';
import { Mascota, MascotaFormData } from '@/types/pet.types';
import { Cliente } from '@/types/client.types';
import petService from '@/services/pet.service';
import clientService from '@/services/client.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
const Grid = (props: any) => <MuiGrid {...props} />;

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const especies = ['Perro', 'Gato', 'Ave', 'Roedor', 'Reptil', 'Otro'];

const Pets: React.FC = () => {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [especieFilter, setEspecieFilter] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  
  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMascota, setSelectedMascota] = useState<Mascota | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Form data
  const [formData, setFormData] = useState<MascotaFormData>({
    cliente_id: 0,
    nombre: '',
    especie: 'Canino',
    raza: '',
    sexo: 'Macho',
    fecha_nacimiento: '',
    color: '',
    peso_actual: undefined,
    microchip: '',
    esterilizado: false,
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MascotaFormData, string>>>({});

  useEffect(() => {
    fetchMascotas();
  }, [page, rowsPerPage, searchTerm, especieFilter]);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchMascotas = async () => {
    setLoading(true);
    try {
      const response = await petService.getMascotas({
        page: page + 1,
        per_page: rowsPerPage,
        search: searchTerm,
        especie: especieFilter,
        activo: true,
      });
      setMascotas(response.mascotas);
      setTotalCount(response.pagination.total);
    } catch (error) {
      toast.error('Error al cargar mascotas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await clientService.getClientes({ per_page: 100, activo: true });
      setClientes(response.clientes);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleEspecieFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEspecieFilter(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenForm = (mascota?: Mascota) => {
    if (mascota) {
      setEditMode(true);
      setSelectedMascota(mascota);
      setFormData({
        cliente_id: mascota.cliente_id,
        nombre: mascota.nombre,
        especie: mascota.especie,
        raza: mascota.raza || '',
        sexo: mascota.sexo,
        fecha_nacimiento: mascota.fecha_nacimiento || '',
        color: mascota.color || '',
        peso_actual: mascota.peso_actual,
        microchip: mascota.microchip || '',
        esterilizado: mascota.esterilizado,
      });
      const cliente = clientes.find(c => c.cliente_id === mascota.cliente_id);
      setSelectedCliente(cliente || null);
    } else {
      setEditMode(false);
      setSelectedMascota(null);
      setFormData({
        cliente_id: 0,
        nombre: '',
        especie: 'Canino',
        raza: '',
        sexo: 'Macho',
        fecha_nacimiento: '',
        color: '',
        peso_actual: undefined,
        microchip: '',
        esterilizado: false,
      });
      setSelectedCliente(null);
    }
    setFormErrors({});
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setTabValue(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof MascotaFormData, string>> = {};

    if (!formData.cliente_id) errors.cliente_id = 'El cliente es requerido';
    if (!formData.nombre) errors.nombre = 'El nombre es requerido';
    if (!formData.especie) errors.especie = 'La especie es requerida';
    if (!formData.sexo) errors.sexo = 'El sexo es requerido';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editMode && selectedMascota) {
        const { cliente_id, ...updateData } = formData;
        await petService.updateMascota(selectedMascota.mascota_id, updateData);
        toast.success('Mascota actualizada correctamente');
      } else {
        await petService.createMascota(formData);
        toast.success('Mascota creada correctamente');
      }
      handleCloseForm();
      fetchMascotas();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar mascota');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (mascota: Mascota) => {
    setLoading(true);
    try {
      const mascotaCompleta = await petService.getMascota(mascota.mascota_id);
      setSelectedMascota(mascotaCompleta);
      setOpenView(true);
    } catch (error) {
      toast.error('Error al cargar información de la mascota');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mascota: Mascota) => {
    if (!window.confirm(`¿Está seguro de desactivar la mascota ${mascota.nombre}?`)) {
      return;
    }

    try {
      await petService.deleteMascota(mascota.mascota_id);
      toast.success('Mascota desactivada correctamente');
      fetchMascotas();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al desactivar mascota');
    }
  };

  const getEspecieIcon = (especie: string) => {
    const iconColor = {
      'Canino': '#8B4513',
      'Felino': '#FF6347',
      'Ave': '#4169E1',
      'Roedor': '#696969',
      'Reptil': '#228B22',
      'Otro': '#9370DB'
    }[especie] || '#9370DB';

    return (
      <Avatar sx={{ bgcolor: iconColor, width: 35, height: 35 }}>
        <PetsIcon />
      </Avatar>
    );
  };

  const calcularEdad = (fechaNacimiento: string | undefined) => {
    if (!fechaNacimiento) return 'Desconocida';
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    const años = hoy.getFullYear() - nacimiento.getFullYear();
    const meses = hoy.getMonth() - nacimiento.getMonth();
    
    if (años === 0) {
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    } else if (años === 1) {
      return '1 año';
    } else {
      return `${años} años`;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Gestión de Mascotas
        </Typography>
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
          Nueva Mascota
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre, raza o microchip..."
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
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Filtrar por especie"
              value={especieFilter}
              onChange={handleEspecieFilterChange}
              slotProps={{
                input: {
                startAdornment: (
                    <InputAdornment position="start">
                    <FilterList />
                    </InputAdornment>
                ),
                },
                inputLabel: {
                shrink: true, //
                },
                select: {
                displayEmpty: true, // ← Esto va aquí
                renderValue: (value: any) => value === "" ? "Todas las especies" : value // ← Y esto también
                }
            }}
            >
              <MenuItem value="">Todas las especies</MenuItem>
              {especies.map((especie) => (
                <MenuItem key={especie} value={especie}>
                  {especie}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
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
                  <TableCell>Mascota</TableCell>
                  <TableCell>Especie/Raza</TableCell>
                  <TableCell>Propietario</TableCell>
                  <TableCell>Edad</TableCell>
                  <TableCell>Peso</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mascotas.map((mascota) => (
                  <TableRow key={mascota.mascota_id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getEspecieIcon(mascota.especie)}
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {mascota.nombre}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {mascota.sexo === 'Macho' ? (
                              <Male sx={{ fontSize: 16, color: '#3498db' }} />
                            ) : (
                              <Female sx={{ fontSize: 16, color: '#e91e63' }} />
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {mascota.sexo}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{mascota.especie}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {mascota.raza || 'Sin especificar'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {mascota.propietario && (
                        <Typography variant="body2">
                          {mascota.propietario.nombre} {mascota.propietario.apellidos}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {calcularEdad(mascota.fecha_nacimiento)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {mascota.peso_actual ? (
                        <Chip
                          icon={<Scale />}
                          label={`${mascota.peso_actual} kg`}
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No registrado
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {mascota.esterilizado && (
                          <Chip label="Esterilizado" size="small" color="success" />
                        )}
                        {mascota.microchip && (
                          <Chip label="Con microchip" size="small" color="info" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" onClick={() => handleView(mascota)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenForm(mascota)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Historia Clínica">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => {/* Navegar a historia clínica */}}
                        >
                          <LocalHospital />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Desactivar">
                        <IconButton size="small" color="error" onClick={() => handleDelete(mascota)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {mascotas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No se encontraron mascotas
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

      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Editar Mascota' : 'Nueva Mascota'}
        </DialogTitle>
        <DialogContent dividers>
          <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} aria-label="tabs mascota">
            <Tab label="Información General" />
            <Tab label="Detalles Adicionales" /> 
            </Tabs>
            <TabPanel value={tabValue} index={0}>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Autocomplete
                        options={clientes}
                        getOptionLabel={(option) => `${option.nombre} ${option.apellidos} - ${option.documento_identidad}`}
                        value={selectedCliente}
                        onChange={(event, newValue) => {
                            setSelectedCliente(newValue);
                            setFormData(prev => ({
                                ...prev,
                                cliente_id: newValue ? newValue.cliente_id : 0
                            }));
                            setFormErrors(prev => ({ ...prev, cliente_id: '' }));
                        }}
                        disabled={editMode}
                        renderInput={(params) => (
                            <TextField 
                                {...params}
                                label="Propietario"
                                error={!!formErrors.cliente_id}
                                helperText={formErrors.cliente_id}
                            />
                        )}
                    />
                    <TextField
                        label="Nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        error={!!formErrors.nombre}
                        helperText={formErrors.nombre}
                        fullWidth
                    />
                    <TextField
                        select
                        label="Especie"
                        name="especie"
                        value={formData.especie}
                        onChange={handleInputChange}
                        error={!!formErrors.especie}
                        helperText={formErrors.especie}
                        fullWidth
                    >
                        {especies.map((especie) => (
                            <MenuItem key={especie} value={especie}>
                                {especie}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Raza"
                        name="raza"
                        value={formData.raza}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        select
                        label="Sexo"
                        name="sexo"
                        value={formData.sexo}
                        onChange={handleInputChange}
                        error={!!formErrors.sexo}
                        helperText={formErrors.sexo}
                        fullWidth
                    >
                        {['Macho', 'Hembra'].map((sexo) => (
                            <MenuItem key={sexo} value={sexo}>
                                {sexo}
                            </MenuItem>
                        ))}
                    </TextField>
                    <DatePicker
                        label="Fecha de Nacimiento"
                        value={formData.fecha_nacimiento ? new Date(formData.fecha_nacimiento + 'T00:00:00') : null}
                        onChange={(newValue) => {
                            if (newValue) {
                            const isoString = newValue.toISOString();
                            const formattedDate = isoString.split('T')[0];
                            setFormData(prev => ({
                                ...prev,
                                fecha_nacimiento: formattedDate
                            }));
                            } else {
                            setFormData(prev => ({
                                ...prev,
                                fecha_nacimiento: ''
                            }));
                            }
                        }}
                        slotProps={{
                            textField: {
                            fullWidth: true
                            }
                        }}
                        disableFuture
                    />
                </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        label="Peso Actual (kg)"
                        name="peso_actual"
                        type="number"
                        value={formData.peso_actual || ''}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        label="Microchip"
                        name="microchip"
                        value={formData.microchip}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <FormControlLabel
                        control={<Checkbox
                            checked={formData.esterilizado}
                            onChange={handleInputChange}
                            name="esterilizado"
                        />}
                        label="Esterilizado"
                    />
                </Box>
            </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="secondary" disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
        <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles de la Mascota</DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
            ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            {getEspecieIcon(selectedMascota?.especie || '')}
                            <Typography variant="h5" fontWeight="bold">
                                {selectedMascota?.nombre}
                            </Typography>
                        </Box>
                        <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Edad</Typography>
                            <Typography variant="body2">
                            {selectedMascota?.edad}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Peso</Typography>
                            <Typography variant="body2">
                            {selectedMascota?.peso_actual ? `${selectedMascota?.peso_actual} kg` : 'No registrado'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Color</Typography>
                            <Typography variant="body2">
                            {selectedMascota?.color || 'No especificado'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Microchip</Typography>
                            <Typography variant="body2">
                            {selectedMascota?.microchip || 'No registrado'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">Estado</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            {selectedMascota?.esterilizado && (
                                <Chip label="Esterilizado" size="small" color="success" />
                            )}
                            {selectedMascota?.activo && (
                                <Chip label="Activo" size="small" color="primary" />
                            )}
                            </Box>
                        </Grid>
                        {selectedMascota?.cliente_id && (
                            <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">Propietario</Typography>
                            <Typography variant="body2">
                                {selectedMascota.propietario.nombre} {selectedMascota.propietario.apellidos}
                            </Typography>
                            <Typography variant="caption">
                                Tel: {selectedMascota.propietario.telefono}
                            </Typography>
                            </Grid>
                        )}
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

export default Pets;
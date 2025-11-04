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
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { Cliente, ClienteFormData } from '@/types/client.types';
import clientService from '@/services/client.service';

const Grid = (props: any) => <MuiGrid {...props} />;

const Clients: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<ClienteFormData>({
    documento_identidad: '',
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ClienteFormData, string>>>({});

  useEffect(() => {
    fetchClientes();
  }, [page, rowsPerPage, searchTerm]);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const response = await clientService.getClientes({
        page: page + 1,
        per_page: rowsPerPage,
        search: searchTerm,
        activo: true,
      });
      setClientes(response.clientes);
      setTotalCount(response.pagination.total);
    } catch (error) {
      toast.error('Error al cargar clientes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenForm = (cliente?: Cliente) => {
    if (cliente) {
      setEditMode(true);
      setSelectedCliente(cliente);
      setFormData({
        documento_identidad: cliente.documento_identidad,
        nombre: cliente.nombre,
        apellidos: cliente.apellidos,
        telefono: cliente.telefono,
        email: cliente.email || '',
        direccion: cliente.direccion || '',
        ciudad: cliente.ciudad || '',
      });
    } else {
      setEditMode(false);
      setSelectedCliente(null);
      setFormData({
        documento_identidad: '',
        nombre: '',
        apellidos: '',
        telefono: '',
        email: '',
        direccion: '',
        ciudad: '',
      });
    }
    setFormErrors({});
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setFormData({
      documento_identidad: '',
      nombre: '',
      apellidos: '',
      telefono: '',
      email: '',
      direccion: '',
      ciudad: '',
    });
    setFormErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'documento_identidad' && !editMode) {
      const onlyNumbers = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: onlyNumbers }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ClienteFormData, string>> = {};

    if (!formData.documento_identidad) errors.documento_identidad = 'El documento es requerido';
    if (!formData.nombre) errors.nombre = 'El nombre es requerido';
    if (!formData.apellidos) errors.apellidos = 'Los apellidos son requeridos';
    if (!formData.telefono) errors.telefono = 'El teléfono es requerido';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editMode && selectedCliente) {
        const { documento_identidad, ...updateData } = formData;
        const updatedCliente = await clientService.updateCliente(selectedCliente.cliente_id, updateData);
        // Actualizar el estado local con el cliente actualizado
        setClientes(prevClientes => 
          prevClientes.map(cliente => 
            cliente.cliente_id === selectedCliente.cliente_id 
              ? { ...cliente, ...updatedCliente } 
              : cliente
          )
        );
        toast.success('Cliente actualizado correctamente');
      } else {
        const newCliente = await clientService.createCliente(formData);
        
        // Agregar el nuevo cliente al estado local
        setClientes(prevClientes => {
          const newClientes = [newCliente, ...prevClientes];
          // Si excede el límite de la página, remover el último
          if (newClientes.length > rowsPerPage) {
            return newClientes.slice(0, rowsPerPage);
          }
          return newClientes;
        });
        
        // Si estamos en una página diferente a la primera, volver a la primera
        if (page !== 0) {
          setPage(0);
        }
        
        toast.success('Cliente creado correctamente');
      }
      handleCloseForm();
      fetchClientes();
    } catch (error: any) {
      console.log(error.response);      
      toast.error(error.response?.data?.message || 'Error al guardar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (cliente: Cliente) => {
    setLoading(true);
    try {
      const clienteCompleto = await clientService.getCliente(cliente.cliente_id, true);
      setSelectedCliente(clienteCompleto);
      setOpenView(true);
    } catch (error) {
      toast.error('Error al cargar información del cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cliente: Cliente) => {
    if (!window.confirm(`¿Está seguro de eliminar al cliente ${cliente.nombre} ${cliente.apellidos}?`)) {
      return;
    }

    try {
      await clientService.deleteCliente(cliente.cliente_id);

      /* setClientes(prevClientes => 
        prevClientes.filter(c => c.cliente_id !== cliente.cliente_id)
      ); */

      toast.success('Cliente eliminado correctamente');
      
      /* if (clientes.length === 1 && page > 0) {
        setPage(page - 1);
      } */
      fetchClientes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar cliente');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Gestión de Clientes
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
          Nuevo Cliente
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre, apellidos, documento o teléfono..."
          value={searchTerm}
          onChange={handleSearchChange}
          id="clients-search-field"
          name="search-clients"
          autoComplete="off"
          slotProps={{
            htmlInput: {
              name: "clients-search",
              id: "clients-search-field",
              autoComplete: "new-password",
              form: {
                autoComplete: "off",
              },
            },
          }}
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
                  <TableCell>Cliente</TableCell>
                  <TableCell>Documento</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell>Dirección</TableCell>
                  <TableCell>Mascotas</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow key={cliente.cliente_id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: '#667eea', width: 35, height: 35 }}>
                          {cliente.nombre[0]}{cliente.apellidos[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {cliente.nombre} {cliente.apellidos}
                          </Typography>
                          {cliente.email && (
                            <Typography variant="caption" color="text.secondary">
                              {cliente.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {cliente.documento_identidad && (
                          <Typography variant="caption" color="text.secondary">
                            {cliente.documento_identidad}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {cliente.telefono && (
                          <Typography variant="caption" color="text.secondary">
                            Cel: {cliente.telefono}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {cliente.direccion && (
                        <Typography variant="body2">
                          {cliente.direccion}
                          {cliente.ciudad && `, ${cliente.ciudad}`}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<Pets />}
                        label={cliente.total_mascotas || 0}
                        size="small"
                        color={cliente.total_mascotas ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" onClick={() => handleView(cliente)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenForm(cliente)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" color="error" onClick={() => handleDelete(cliente)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {clientes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No se encontraron clientes
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
              {editMode ? 'Editar Cliente' : 'Nuevo Cliente'}
            </Typography>
            <IconButton onClick={handleCloseForm} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Número de Documento"
                name="documento_identidad"
                value={formData.documento_identidad}
                onChange={handleInputChange}
                error={!!formErrors.documento_identidad}
                helperText={formErrors.documento_identidad}
                disabled={editMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombres"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                error={!!formErrors.nombre}
                helperText={formErrors.nombre}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                error={!!formErrors.apellidos}
                helperText={formErrors.apellidos}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                error={!!formErrors.telefono}
                helperText={formErrors.telefono}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
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
            <Typography variant="h6">Información del Cliente</Typography>
            <IconButton onClick={() => setOpenView(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedCliente && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 60, height: 60, bgcolor: '#667eea' }}>
                        {selectedCliente.nombre[0]}{selectedCliente.apellidos[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {selectedCliente.nombre} {selectedCliente.apellidos}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                        <Typography variant="body2">{selectedCliente.telefono}</Typography>
                      </Grid>
                      {selectedCliente.email && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">Email</Typography>
                          <Typography variant="body2">{selectedCliente.email}</Typography>
                        </Grid>
                      )}
                      {selectedCliente.direccion && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">Dirección</Typography>
                          <Typography variant="body2">
                            {selectedCliente.direccion}
                            {selectedCliente.ciudad && `, ${selectedCliente.ciudad}`}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              {selectedCliente.mascotas && selectedCliente.mascotas.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Mascotas ({selectedCliente.mascotas.length})
                  </Typography>
                  <List>
                    {selectedCliente.mascotas.map((mascota, index) => (
                      <React.Fragment key={mascota.mascota_id}>
                        <ListItem>
                          <ListItemText
                            primary={mascota.nombre}
                            secondary={`${mascota.especie} - ${mascota.raza || 'Sin raza'} - ${mascota.sexo}`}
                          />
                        </ListItem>
                        {index < selectedCliente.mascotas!.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Clients;
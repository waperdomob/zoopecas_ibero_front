// src/pages/Profile.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Paper,
  Grid as MuiGrid,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
} from '@mui/material';

import {
  Person,
  Email,
  Phone,
  Badge,
  Lock,
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Visibility,
  VisibilityOff,
  AccessTime,
  CheckCircle,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estados para cambio de contraseña
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Estados para edición de perfil
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellidos: user?.apellidos || '',
    telefono: user?.telefono || '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setEditMode(false);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancelar edición, restaurar valores originales
      setFormData({
        nombre: user?.nombre || '',
        apellidos: user?.apellidos || '',
        telefono: user?.telefono || '',
      });
    }
    setEditMode(!editMode);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await updateProfile(formData);
      setEditMode(false);
      setSuccessMessage('Perfil actualizado correctamente');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Aquí iría la llamada al servicio para cambiar la contraseña
    setLoading(true);
    try {
      // await authService.changePassword(passwordData);
      setSuccessMessage('Contraseña actualizada correctamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setErrorMessage('Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const getRolColor = (rol: string) => {
    const colors: Record<string, string> = {
      'Administrador': '#e74c3c',
      'Veterinario': '#3498db',
      'Asistente': '#2ecc71',
      'Recepcionista': '#f39c12',
    };
    return colors[rol] || '#95a5a6';
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Mi Perfil
      </Typography>

      <Grid container spacing={3}>
        {/* Tarjeta de Información Principal */}
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {user?.nombre?.[0]}{user?.apellidos?.[0]}
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'white',
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
                size="small"
              >
                <PhotoCamera fontSize="small" />
              </IconButton>
            </Box>
            
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {user?.nombre} {user?.apellidos}
            </Typography>
            
            <Chip
              label={user?.rol}
              sx={{
                backgroundColor: getRolColor(user?.rol || ''),
                color: 'white',
                fontWeight: 'bold',
                mb: 2,
              }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Person color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Usuario: <strong>{user?.username}</strong>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Email color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              {user?.telefono && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Phone color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {user.telefono}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Último acceso: {user?.ultimo_acceso ? 
                    format(new Date(user.ultimo_acceso), "d 'de' MMMM, HH:mm", { locale: es }) : 
                    'Primera vez'}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Tarjeta de Configuración */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Información Personal" />
              <Tab label="Seguridad" />
              <Tab label="Actividad" />
            </Tabs>

            {successMessage && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {successMessage}
              </Alert>
            )}

            {errorMessage && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <TabPanel value={tabValue} index={0}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      disabled={!editMode}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
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
                      onChange={handleChange}
                      disabled={!editMode}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={user?.email}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="El email no puede ser modificado"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Rol"
                      value={user?.rol}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Badge color="action" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="El rol es asignado por un administrador"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      {!editMode ? (
                        <Button
                          variant="contained"
                          startIcon={<Edit />}
                          onClick={handleEditToggle}
                        >
                          Editar Perfil
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outlined"
                            startIcon={<Cancel />}
                            onClick={handleEditToggle}
                            disabled={loading}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                            disabled={loading}
                          >
                            Guardar Cambios
                          </Button>
                        </>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Cambiar Contraseña
              </Typography>
              <form onSubmit={handlePasswordSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Contraseña Actual"
                      name="currentPassword"
                      type={showPassword.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                              edge="end"
                            >
                              {showPassword.current ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nueva Contraseña"
                      name="newPassword"
                      type={showPassword.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                              edge="end"
                            >
                              {showPassword.new ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirmar Nueva Contraseña"
                      name="confirmPassword"
                      type={showPassword.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                              edge="end"
                            >
                              {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    >
                      Actualizar Contraseña
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Actividad Reciente
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Esta función estará disponible próximamente...
              </Typography>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
import React, { useState } from 'react';
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
  InputAdornment,
  Typography,
  Box,
} from '@mui/material';
import {
  Person,
  Phone,
  Email,
  Home,
  LocationCity,
  Badge,
} from '@mui/icons-material';
import clientService from '../../services/client.service';
import { ClienteFormData } from '../../types/client.types';

interface NuevoClienteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const Grid = (props: any) => <MuiGrid {...props} />;
const NuevoClienteModal: React.FC<NuevoClienteModalProps> = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ClienteFormData>({
    documento_identidad: '',
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ClienteFormData, string>>>({});

  const validateField = (name: keyof ClienteFormData, value: string): string => {
    switch (name) {
      case 'nombre':
        if (!value.trim()) return 'El nombre es requerido';
        if (value.length < 2) return 'El nombre debe tener al menos 2 caracteres';
        return '';
      
      case 'apellidos':
        if (!value.trim()) return 'Los apellidos son requeridos';
        if (value.length < 2) return 'Los apellidos deben tener al menos 2 caracteres';
        return '';
      
      case 'telefono':
        if (!value.trim()) return 'El teléfono es requerido';
        if (!/^\d{7,10}$/.test(value.replace(/\s/g, ''))) {
          return 'Ingrese un teléfono válido (7-10 dígitos)';
        }
        return '';
      
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Ingrese un email válido';
        }
        return '';
      
      case 'documento_identidad':
        if (value && value.length < 5) {
          return 'El documento debe tener al menos 5 caracteres';
        }
        return '';
      
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Validar campo
    const error = validateField(name as keyof ClienteFormData, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async () => {
    try {
      setError(null);

      // Validar todos los campos
      const newErrors: Partial<Record<keyof ClienteFormData, string>> = {};
      let hasErrors = false;

      (Object.keys(formData) as Array<keyof ClienteFormData>).forEach((key) => {
        const error = validateField(key, formData[key] || '');
        if (error) {
          newErrors[key] = error;
          hasErrors = true;
        }
      });

      setErrors(newErrors);

      if (hasErrors) {
        setError('Por favor corrija los errores en el formulario');
        return;
      }

      // Validaciones adicionales
      if (!formData.nombre.trim()) {
        setError('El nombre es requerido');
        return;
      }

      if (!formData.apellidos.trim()) {
        setError('Los apellidos son requeridos');
        return;
      }

      if (!formData.telefono.trim()) {
        setError('El teléfono es requerido');
        return;
      }

      setLoading(true);

      await clientService.createCliente(formData);
      
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Error al crear cliente:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 409) {
        setError('Ya existe un cliente con ese documento de identidad');
      } else {
        setError('Error al crear el cliente. Por favor intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      documento_identidad: '',
      nombre: '',
      apellidos: '',
      telefono: '',
      email: '',
      direccion: '',
      ciudad: '',
    });
    setErrors({});
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person />
          <Typography variant="h6">Nuevo Cliente</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Nombre */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              name="nombre"
              label="Nombre *"
              value={formData.nombre}
              onChange={handleChange}
              error={!!errors.nombre}
              helperText={errors.nombre}
              placeholder="Nombre del cliente..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Apellidos */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              name="apellidos"
              label="Apellidos *"
              value={formData.apellidos}
              onChange={handleChange}
              error={!!errors.apellidos}
              helperText={errors.apellidos}
              placeholder="Apellidos del cliente..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Documento de Identidad */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              name="documento_identidad"
              label="Documento de Identidad"
              value={formData.documento_identidad}
              onChange={handleChange}
              error={!!errors.documento_identidad}
              helperText={errors.documento_identidad}
              placeholder="Cédula o pasaporte..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Teléfono */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              name="telefono"
              label="Teléfono *"
              value={formData.telefono}
              onChange={handleChange}
              error={!!errors.telefono}
              helperText={errors.telefono}
              placeholder="3001234567"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              placeholder="correo@ejemplo.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Ciudad */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              name="ciudad"
              label="Ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              placeholder="Bogotá, Medellín, Cali..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationCity />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Dirección */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="direccion"
              label="Dirección"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Calle 123 #45-67..."
              multiline
              rows={2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              * Campos requeridos
            </Typography>
          </Grid>
        </Grid>
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
          {loading ? 'Guardando...' : 'Crear Cliente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NuevoClienteModal;
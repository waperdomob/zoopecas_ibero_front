import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  CircularProgress,
  Grid as MuiGrid,
} from '@mui/material';
import { Close, Save } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import medicalService from '@/services/medical.service';

interface SeguimientoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  consultaId?: number;
}

// Wrapper para Grid
const Grid = (props: any) => <MuiGrid {...props} />;
const SeguimientoModal: React.FC<SeguimientoModalProps> = ({
  open,
  onClose,
  onSuccess,
  consultaId,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fecha_seguimiento: new Date().toISOString().split('T')[0],
    hora_seguimiento: new Date().toTimeString().slice(0, 5),
    observaciones: '',
    responsable: '',
  });

  const handleSubmit = async () => {
    if (!consultaId) return;
    
    if (!formData.observaciones.trim()) {
      toast.error('Las observaciones son requeridas');
      return;
    }

    setLoading(true);
    try {
      await medicalService.createSeguimiento({
        consulta_id: consultaId,
        ...formData,
      });
      toast.success('Seguimiento agregado exitosamente');
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al agregar seguimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fecha_seguimiento: new Date().toISOString().split('T')[0],
      hora_seguimiento: new Date().toTimeString().slice(0, 5),
      observaciones: '',
      responsable: '',
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Agregar Seguimiento
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha"
              type="date"
              value={formData.fecha_seguimiento}
              onChange={(e) => setFormData(prev => ({ ...prev, fecha_seguimiento: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Hora"
              type="time"
              value={formData.hora_seguimiento}
              onChange={(e) => setFormData(prev => ({ ...prev, hora_seguimiento: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Responsable"
              value={formData.responsable}
              onChange={(e) => setFormData(prev => ({ ...prev, responsable: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Observaciones *"
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              placeholder="Describa el seguimiento realizado..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeguimientoModal;
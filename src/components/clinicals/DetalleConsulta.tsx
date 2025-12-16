import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid as MuiGrid,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Comment,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import medicalService from '@/services/medical.service';
import { Consulta, SeguimientoPaciente } from '@/types/medical.types';
import SeguimientoModal from './SeguimientoModal';

// Wrapper para Grid
const Grid = (props: any) => <MuiGrid {...props} />;

const DetalleConsulta: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [seguimientos, setSeguimientos] = useState<SeguimientoPaciente[]>([]);
  const [modalSeguimientoOpen, setModalSeguimientoOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadConsulta();
      loadSeguimientos();
    }
  }, [id]);

  const loadConsulta = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await medicalService.getConsulta(parseInt(id!));
      setConsulta(data);
    } catch (err) {
      console.error('Error al cargar consulta:', err);
      setError('Error al cargar la consulta');
    } finally {
      setLoading(false);
    }
  };

  const loadSeguimientos = async () => {
    try {
      const data = await medicalService.getSeguimientos(parseInt(id!));
      console.log(data);
      setSeguimientos(data);
    } catch (err) {
      console.error('Error al cargar seguimientos:', err);
    }
  };

  const handleSeguimientoSuccess = () => {
    loadSeguimientos();
    setModalSeguimientoOpen(false);
    toast.success('Seguimiento agregado exitosamente');
  };
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!consulta) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Consulta no encontrada
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/medical-records/consultations')}
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
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/medical-records/consultations')}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Consulta #{consulta.consulta_id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(parseISO(consulta.fecha_consulta), "d 'de' MMMM 'de' yyyy", { locale: es })} - {consulta.hora_consulta}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Información General */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Información de la Consulta
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Veterinario
                  </Typography>
                  <Typography variant="body1">
                    Dr. {consulta.veterinario?.nombre} {consulta.veterinario?.apellidos}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Motivo de Consulta
                  </Typography>
                  <Typography variant="body1">
                    {consulta.motivo_consulta}
                  </Typography>
                </Box>

                {consulta.diagnostico && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Diagnóstico
                    </Typography>
                    <Typography variant="body1">
                      {consulta.diagnostico}
                    </Typography>
                  </Box>
                )}

                {consulta.pronostico && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Pronóstico
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={consulta.pronostico}
                        color={
                          consulta.pronostico === 'Favorable' ? 'success' :
                          consulta.pronostico === 'Desfavorable' ? 'error' : 'warning'
                        }
                        size="small"
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Signos Vitales */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Signos Vitales
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {consulta.temperatura && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Temperatura
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {consulta.temperatura}°C
                    </Typography>
                  </Grid>
                )}
                {consulta.peso && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Peso
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {consulta.peso} kg
                    </Typography>
                  </Grid>
                )}
                {consulta.pulso && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Pulso
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {consulta.pulso} lpm
                    </Typography>
                  </Grid>
                )}
                {consulta.respiracion && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Respiración
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {consulta.respiracion} rpm
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Tratamiento */}
        {(consulta.tratamiento_instaurado || consulta.tratamiento_ideal) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Tratamiento
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {consulta.tratamiento_instaurado && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Tratamiento Instaurado
                    </Typography>
                    <Typography variant="body2">
                      {consulta.tratamiento_instaurado}
                    </Typography>
                  </Box>
                )}

                {consulta.tratamiento_ideal && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Tratamiento Ideal
                    </Typography>
                    <Typography variant="body2">
                      {consulta.tratamiento_ideal}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
        
        {/* Seguimientos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Seguimientos ({seguimientos.length})
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {seguimientos.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Comment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No hay seguimientos registrados
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setModalSeguimientoOpen(true)}
                    sx={{ mt: 2 }}
                  >
                    Agregar Primer Seguimiento
                  </Button>
                </Box>
              ) : (
                <List>
                  {seguimientos.map((seguimiento, index) => (
                    <React.Fragment key={seguimiento.seguimiento_id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#667eea' }}>
                            <Comment />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {seguimiento.responsable || 'Seguimiento'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(parseISO(seguimiento.fecha_seguimiento), "d 'de' MMMM, yyyy", { locale: es })}
                                {seguimiento.hora_seguimiento && ` - ${seguimiento.hora_seguimiento}`}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              color="text.primary"
                              sx={{ mt: 1, whiteSpace: 'pre-line' }}
                            >
                              {seguimiento.observaciones}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < seguimientos.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Observaciones */}
        {consulta.observaciones && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Observaciones
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2">
                  {consulta.observaciones}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <SeguimientoModal
        open={modalSeguimientoOpen}
        onClose={() => setModalSeguimientoOpen(false)}
        onSuccess={handleSeguimientoSuccess}
        consultaId={consulta.consulta_id}
      />
    </Box>
  );
};

export default DetalleConsulta;
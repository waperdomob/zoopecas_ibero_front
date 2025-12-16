import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Typography,
  Tooltip,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  Grid as MuiGrid,
  MenuItem,
} from '@mui/material';
import {
  Search,
  Visibility,
  LocalHospital,
  Person,
  Pets,
  CalendarToday,
  FilterList,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Consulta } from '@/types/medical.types';
import medicalService from '@/services/medical.service';

// Wrapper para Grid
const Grid = (props: any) => <MuiGrid {...props} />;

const Consultas: React.FC = () => {
  const navigate = useNavigate();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filtros
  const [filters, setFilters] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    veterinario_id: undefined as number | undefined,
  });

  useEffect(() => {
    fetchConsultas();
  }, [page, rowsPerPage, filters]);

  const fetchConsultas = async () => {
    setLoading(true);
    try {
      const response = await medicalService.getConsultas({
        page: page + 1,
        per_page: rowsPerPage,
        ...(filters.fecha_desde && { fecha_desde: filters.fecha_desde }),
        ...(filters.fecha_hasta && { fecha_hasta: filters.fecha_hasta }),
        ...(filters.veterinario_id && { veterinario_id: filters.veterinario_id }),
      });
      setConsultas(response.consultas);
      setTotalCount(response.pagination.total);
    } catch (error) {
      toast.error('Error al cargar consultas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field: string, value: string) => {
    if (field === 'veterinario_id') {
      setFilters(prev => ({ 
        ...prev, 
        [field]: value ? parseInt(value) : undefined 
      }));
    } else {
      setFilters(prev => ({ ...prev, [field]: value }));
    }
    setPage(0);
  };

  const handleViewConsulta = (consulta: Consulta) => {
    navigate(`/medical-records/consultation/${consulta.consulta_id}`);
  };

  const getPronosticoColor = (pronostico?: string) => {
    switch (pronostico) {
      case 'Favorable': return 'success';
      case 'Desfavorable': return 'error';
      case 'Reservado': return 'warning';
      default: return 'default';
    }
  };

  const clearFilters = () => {
    setFilters({
      fecha_desde: '',
      fecha_hasta: '',
      veterinario_id: undefined,
    });
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Consultas Médicas
        </Typography>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Fecha Desde"
              type="date"
              value={filters.fecha_desde}
              onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Fecha Hasta"
              type="date"
              value={filters.fecha_hasta}
              onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              sx={{ height: '56px' }}
            >
              Limpiar Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla */}
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
                  <TableCell>Mascota</TableCell>
                  <TableCell>Veterinario</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell>Diagnóstico</TableCell>
                  <TableCell>Pronóstico</TableCell>
                  <TableCell>Peso</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consultas.map((consulta) => (
                  <TableRow key={consulta.consulta_id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {format(parseISO(consulta.fecha_consulta), "d 'de' MMMM, yyyy", { locale: es })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {consulta.hora_consulta}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: '#9b59b6', width: 35, height: 35 }}>
                          <Pets fontSize="small" />
                        </Avatar>
                        <Typography variant="body2">
                          {consulta.historia?.mascota?.nombre || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        Dr. {consulta.veterinario?.nombre} {consulta.veterinario?.apellidos}
                      </Typography>
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
                      {consulta.pronostico && (
                        <Chip
                          label={consulta.pronostico}
                          size="small"
                          color={getPronosticoColor(consulta.pronostico)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {consulta.peso ? `${consulta.peso} kg` : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" onClick={() => handleViewConsulta(consulta)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {consultas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No se encontraron consultas
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
    </Box>
  );
};

export default Consultas;
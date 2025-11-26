import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid as MuiGrid,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search,
  Visibility,
  Pets,
  CalendarToday,
  LocalHospital,
  Add,
  FilterList,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import medicalService from '../../services/medical.service';
import petService from '../../services/pet.service';
import { HistoriaClinica } from '../../types/medical.types';
import { Mascota } from '../../types/pet.types';

const Grid = (props: any) => <MuiGrid {...props} />;

const HistoriasClinicas: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
  const [totalHistorias, setTotalHistorias] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [mascotas, setMascotas] = useState<Mascota[]>([]);

  useEffect(() => {
    loadHistorias();
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadMascotas();
  }, []);

  const loadHistorias = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await medicalService.getHistorias({
        page: page + 1,
        per_page: rowsPerPage,
      });
      setHistorias(response.historias);
      setTotalHistorias(response.pagination.total);
    } catch (err) {
      console.error('Error al cargar historias:', err);
      setError('Error al cargar las historias clínicas');
    } finally {
      setLoading(false);
    }
  };

  const loadMascotas = async () => {
    try {
      const response = await petService.getMascotas({ per_page: 1000 });
      setMascotas(response.mascotas);
    } catch (err) {
      console.error('Error al cargar mascotas:', err);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewHistoria = (historiaId: number) => {
    navigate(`/medical-records/detail/${historiaId}`);
  };

  const filteredHistorias = historias.filter((historia) => {
    const mascota = historia.mascota;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      mascota?.nombre.toLowerCase().includes(searchLower) ||
      mascota?.especie.toLowerCase().includes(searchLower) ||
      mascota?.propietario?.nombre.toLowerCase().includes(searchLower) ||
      mascota?.propietario?.apellidos.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Historias Clínicas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión de historias clínicas y consultas
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="white" variant="body2" sx={{ opacity: 0.9 }}>
                    Total Historias
                  </Typography>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {totalHistorias}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 56, height: 56 }}>
                  <LocalHospital sx={{ color: 'white', fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="white" variant="body2" sx={{ opacity: 0.9 }}>
                    Historias Activas
                  </Typography>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {historias.filter(h => h.activa).length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 56, height: 56 }}>
                  <Pets sx={{ color: 'white', fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="white" variant="body2" sx={{ opacity: 0.9 }}>
                    Mascotas Registradas
                  </Typography>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {mascotas.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 56, height: 56 }}>
                  <Pets sx={{ color: 'white', fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="white" variant="body2" sx={{ opacity: 0.9 }}>
                    Consultas del Mes
                  </Typography>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {historias.reduce((sum, h) => sum + (h.consultas?.length || 0), 0)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 56, height: 56 }}>
                  <CalendarToday sx={{ color: 'white', fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar por mascota, especie o propietario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {/* Implementar filtros */}}
              >
                Filtros
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mascota</TableCell>
                    <TableCell>Especie</TableCell>
                    <TableCell>Propietario</TableCell>
                    <TableCell>Peso Inicial</TableCell>
                    <TableCell>Consultas</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHistorias.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">
                          {searchTerm ? 'No se encontraron resultados' : 'No hay historias clínicas registradas'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHistorias.map((historia) => (
                      <TableRow key={historia.historia_id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#9b59b6' }}>
                              <Pets />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {historia.mascota?.nombre}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {historia.historia_id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={historia.mascota?.especie} 
                            size="small"
                            sx={{ 
                              bgcolor: historia.mascota?.especie === 'Perro' ? '#3498db22' : '#e74c3c22',
                              color: historia.mascota?.especie === 'Perro' ? '#3498db' : '#e74c3c'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {historia.mascota?.propietario?.nombre} {historia.mascota?.propietario?.apellidos}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {historia.peso_inicial ? `${historia.peso_inicial} kg` : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${historia.consultas?.length || 0} consultas`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={historia.activa ? 'Activa' : 'Inactiva'}
                            size="small"
                            color={historia.activa ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewHistoria(historia.historia_id)}
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalHistorias}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default HistoriasClinicas;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
} from '@mui/material';
import { Lock, Home, ArrowBack } from '@mui/icons-material';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            padding: 4,
            textAlign: 'center',
            backgroundColor: 'transparent',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: '#fee',
              mb: 3,
            }}
          >
            <Lock sx={{ fontSize: 60, color: '#e74c3c' }} />
          </Box>
          
          <Typography
            variant="h1"
            sx={{
              fontSize: '6rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            401
          </Typography>
          
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Acceso No Autorizado
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            No tienes los permisos necesarios para acceder a esta página.
            Si crees que esto es un error, contacta con el administrador.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              size="large"
            >
              Volver
            </Button>
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={() => navigate('/dashboard')}
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              }}
            >
              Ir al Dashboard
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Unauthorized;
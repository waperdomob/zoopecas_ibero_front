// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

// Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#8b9aff',
      dark: '#4754b7',
    },
    secondary: {
      main: '#764ba2',
      light: '#9c6cc4',
      dark: '#512b73',
    },
    success: {
      main: '#2ecc71',
      light: '#58d68d',
      dark: '#27ae60',
    },
    error: {
      main: '#e74c3c',
      light: '#ec7063',
      dark: '#c0392b',
    },
    warning: {
      main: '#f39c12',
      light: '#f5b041',
      dark: '#d68910',
    },
    info: {
      main: '#3498db',
      light: '#5dade2',
      dark: '#2874a6',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <Router>
          <AuthProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#333',
                  color: '#fff',
                  borderRadius: '8px',
                },
                success: {
                  iconTheme: {
                    primary: '#2ecc71',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#e74c3c',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              
              {/* Rutas protegidas */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                
                {/* Aquí se agregarán más rutas según se vayan desarrollando */}
                {/* <Route path="clients" element={<Clients />} /> */}
                {/* <Route path="pets" element={<Pets />} /> */}
                {/* <Route path="appointments" element={<Appointments />} /> */}
                {/* <Route path="inventory" element={<Inventory />} /> */}
                {/* <Route path="billing" element={<Billing />} /> */}
                {/* <Route path="medical-records/*" element={<MedicalRecords />} /> */}
                
                {/* Rutas con restricción de roles */}
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute allowedRoles={['Administrador']}>
                      <div>Configuración (En desarrollo)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute allowedRoles={['Administrador', 'Veterinario']}>
                      <div>Reportes (En desarrollo)</div>
                    </ProtectedRoute>
                  }
                />
              </Route>
              
              {/* Páginas de error */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
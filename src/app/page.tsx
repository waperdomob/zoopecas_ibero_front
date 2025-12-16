'use client'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

import { AuthProvider } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import ClientsPage from '@/pages/Clients';
import Profile from '@/pages/Profile';
import Unauthorized from '@/pages/Unauthorized';
import NotFound from '@/pages/NotFound';
import Pets from '@/pages/Pets';
import Appointments from '@/pages/appointments';
import MedicalRecords from '@/pages/MedicalRecords';
import DetalleHistoriaClinica from '@/components/clinicals/DetalleHistoriaClinica';
import DetalleConsulta from '@/components/clinicals/DetalleConsulta';
import ConsultasPage from '@/pages/Consultas';

// Theme configuration (mantén tu configuración actual)
const theme = createTheme({
  // ... tu configuración de theme
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
                <Route path="clients" element={<ClientsPage />} /> 
                <Route path="pets" element={<Pets />} />
                <Route path="appointments" element={<Appointments />} />
                
                {/* Rutas de Historia Clínica */}
                <Route path="medical-records">
                  <Route index element={<MedicalRecords />} />
                  <Route path="history" element={<MedicalRecords />} />
                  <Route path="consultations" element={<ConsultasPage />} />
                  <Route path="detail/:id" element={<DetalleHistoriaClinica />} />
                  <Route path="consultation/:id" element={<DetalleConsulta />} />
                </Route>
                
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
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Pets,
  Description,
  EventNote,
  Inventory,
  Receipt,
  Settings,
  Notifications,
  AccountCircle,
  Logout,
  ChevronLeft,
  ExpandLess,
  ExpandMore,
  LocalHospital,
  Assessment,
} from '@mui/icons-material';

const drawerWidth = 280;

interface MenuItemType {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
  children?: MenuItemType[];
}

const menuItems: MenuItemType[] = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Clientes', icon: <People />, path: '/clients' },
  { text: 'Mascotas', icon: <Pets />, path: '/pets' },
  { 
    text: 'Historia Clínica', 
    icon: <Description />, 
    path: '/medical-records',
    children: [
      { text: 'Consultas', icon: <LocalHospital />, path: '/medical-records/consultations' },
      { text: 'Vacunas', icon: <LocalHospital />, path: '/medical-records/vaccines' },
      { text: 'Historial', icon: <Description />, path: '/medical-records/history' },
    ]
  },
  { text: 'Citas', icon: <EventNote />, path: '/appointments' },
  { text: 'Inventario', icon: <Inventory />, path: '/inventory' },
  { text: 'Facturación', icon: <Receipt />, path: '/billing' },
  { text: 'Reportes', icon: <Assessment />, path: '/reports', roles: ['Administrador', 'Veterinario'] },
  { text: 'Configuración', icon: <Settings />, path: '/settings', roles: ['Administrador'] },
];

const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    handleProfileMenuClose();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const toggleExpand = (text: string) => {
    setExpandedItems(prev =>
      prev.includes(text)
        ? prev.filter(item => item !== text)
        : [...prev, text]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (item: MenuItemType) => {
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return isActive(item.path);
  };

  const renderMenuItem = (item: MenuItemType, depth = 0) => {
    if (item.roles && !hasRole(item.roles)) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.text);
    const active = isParentActive(item);

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                toggleExpand(item.text);
              } else {
                handleNavigate(item.path);
              }
            }}
            sx={{
              pl: 2 + depth * 2,
              backgroundColor: active ? 'rgba(103, 126, 234, 0.1)' : 'transparent',
              borderLeft: active ? '4px solid #667eea' : '4px solid transparent',
              '&:hover': {
                backgroundColor: 'rgba(103, 126, 234, 0.05)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: active ? '#667eea' : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: active ? 600 : 400,
                color: active ? '#667eea' : 'inherit',
              }}
            />
            {hasChildren && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Pets sx={{ fontSize: 30 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Zoopecas
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Sistema Veterinario
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, py: 1 }}>
        {menuItems.map(item => renderMenuItem(item))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: '#f5f7fa',
          }}
        >
          <Avatar
            sx={{
              width: 35,
              height: 35,
              bgcolor: '#667eea',
              fontSize: '0.9rem',
            }}
          >
            {user?.nombre?.[0]}{user?.apellidos?.[0]}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight="medium" noWrap>
              {user?.nombre} {user?.apellidos}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.rol}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => isParentActive(item))?.text || 'Dashboard'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notificaciones">
              <IconButton color="inherit">
                <Badge badgeContent={4} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Perfil">
              <IconButton
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{ ml: 1 }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: '#667eea',
                    fontSize: '0.9rem',
                  }}
                >
                  {user?.nombre?.[0]}{user?.apellidos?.[0]}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Mi Perfil
        </MenuItem>
        <MenuItem onClick={() => { handleNavigate('/settings'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Configuración
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Cerrar Sesión
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '1px 0 3px rgba(0, 0, 0, 0.05)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          backgroundColor: '#f5f7fa',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
'use client';

import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  Typography, 
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useAuth } from '@/lib/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookingsIcon from '@mui/icons-material/EventNote';
import BuildingsIcon from '@mui/icons-material/Business';
import ResourceIcon from '@mui/icons-material/Inventory';
import MaintenanceIcon from '@mui/icons-material/Build';
import UserIcon from '@mui/icons-material/People';
import FacilityIcon from '@mui/icons-material/HomeRepairService';

const drawerWidth = 240;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const role = user?.role || 'STUDENT';

  const menuItems = [
    { text: 'Overview', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Resources', icon: <ResourceIcon />, path: '/dashboard/resources' },
    { text: 'Bookings', icon: <BookingsIcon />, path: '/dashboard/bookings' },
    { text: 'Buildings', icon: <BuildingsIcon />, path: '/dashboard/buildings' },
    { text: 'Facilities', icon: <FacilityIcon />, path: '/dashboard/facilities' },
    ...(role !== 'STUDENT' ? [{ text: 'Maintenance', icon: <MaintenanceIcon />, path: '/dashboard/maintenance' }] : []),
    ...(role === 'ADMIN' ? [{ text: 'Users', icon: <UserIcon />, path: '/dashboard/users' }] : []),
  ];

  const drawerContent = (
    <>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box component="img" src="/logo.png" sx={{ width: 40, height: 40, borderRadius: 1 }} alt="InfraNexis Logo" />
        <Typography variant="h6" fontWeight="800" color="primary" sx={{ letterSpacing: 1 }}>
          InfraNexis
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ overflow: 'auto', mt: 1 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                onClick={() => {
                   router.push(item.path);
                   if (isMobile) onClose();
                }}
                selected={pathname === item.path}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: '#ffffff',
                    '& .MuiListItemIcon-root': { color: '#ffffff' },
                    '&:hover': { backgroundColor: 'primary.dark' }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: pathname === item.path ? '#ffffff' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: pathname === item.path ? 600 : 400 }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </>
  );

  return (
    <>
      {/* Desktop Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            borderRight: '1px solid #e0e0e0',
            backgroundColor: '#ffffff'
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Temporary Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}


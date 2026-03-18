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
  Divider 
} from '@mui/material';
import { useAuth } from '@/lib/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookingsIcon from '@mui/icons-material/EventNote';
import BuildingsIcon from '@mui/icons-material/Business';
import ResourceIcon from '@mui/icons-material/Inventory';
import MaintenanceIcon from '@mui/icons-material/Build';
import UserIcon from '@mui/icons-material/People';
import ReportsIcon from '@mui/icons-material/Assessment';
import FacilityIcon from '@mui/icons-material/HomeRepairService';

const drawerWidth = 240;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

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

  return (
    <Drawer
      variant="permanent"
      sx={{
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
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1 }} />
        <Typography variant="h6" fontWeight="700" color="primary">
          RMS
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ overflow: 'auto', mt: 1 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                onClick={() => router.push(item.path)}
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
    </Drawer>
  );
}

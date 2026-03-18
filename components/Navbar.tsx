'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '@/lib/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', backgroundColor: '#ffffff', color: '#333' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
          <Box component="img" src="/logo.png" sx={{ width: 32, height: 32, borderRadius: 0.5 }} alt="Logo" />
          <Typography variant="h6" component="div" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 0.5 }}>
            RESOURCE MANAGEMENT SYSTEM
          </Typography>
        </Box>
        
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {user.name}
              </Typography>
            </Box>
            <Button 
              startIcon={<LogoutIcon />} 
              onClick={logout}
              color="inherit"
              size="small"
              sx={{ fontWeight: 500 }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

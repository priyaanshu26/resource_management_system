'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, useMediaQuery, useTheme } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '@/lib/AuthContext';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', backgroundColor: '#ffffff', color: '#333', top: 0 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onMenuClick}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          {!isMobile && (
             <Box component="img" src="/logo.png" sx={{ width: 32, height: 32, borderRadius: 0.5 }} alt="Logo" />
          )}
          <Typography variant="h6" component="div" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 0.5, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            INFRANEXIS
          </Typography>
        </Box>
        
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 }, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
                {user.name}
              </Typography>
            </Box>
            <IconButton 
              onClick={logout}
              color="inherit"
              size="small"
              sx={{ display: { xs: 'flex', sm: 'none' } }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
            <Button 
              startIcon={<LogoutIcon />} 
              onClick={logout}
              color="inherit"
              size="small"
              sx={{ fontWeight: 500, display: { xs: 'none', sm: 'flex' } }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}


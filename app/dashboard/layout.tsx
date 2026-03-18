'use client';

import React, { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <Sidebar 
        mobileOpen={mobileOpen} 
        onClose={() => setMobileOpen(false)} 
      />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          width: { md: `calc(100% - 240px)` },
          minWidth: 0 // Prevent content from overflowing
        }}
      >
        <Navbar onMenuClick={handleDrawerToggle} />
        <Box sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}


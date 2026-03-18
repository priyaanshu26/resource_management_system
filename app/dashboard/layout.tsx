import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        {children}
      </Box>
    </Box>
  );
}

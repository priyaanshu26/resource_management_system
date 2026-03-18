'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login on load
    router.replace('/login');
  }, [router]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
      <CircularProgress />
    </Box>
  );
}

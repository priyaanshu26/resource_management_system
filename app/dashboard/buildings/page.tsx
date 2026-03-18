'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Divider, 
  CircularProgress, 
  Alert,
  Chip,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import BuildingIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface Building {
  id: number;
  buildingName: string;
  buildingNumber: string;
  totalFloors: number;
  _count: { resources: number };
}

const buildingSchema = z.object({
  buildingName: z.string().min(2, 'Name is required'),
  buildingNumber: z.string().min(1, 'Number is required'),
  totalFloors: z.string().transform(Number).pipe(z.number().min(1, 'Must be at least 1')),
});

type BuildingForm = z.infer<typeof buildingSchema>;

export default function BuildingsPage() {
  const { token, user } = useAuth();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BuildingForm>({
    resolver: zodResolver(buildingSchema),
  });

  useEffect(() => {
    if (token) {
      fetchBuildings();
    }
  }, [token]);

  const fetchBuildings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/buildings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch buildings');
      const data = await response.json();
      setBuildings(data.buildings || []);
    } catch (err) {
      console.error(err);
      setError('Could not load buildings data.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: BuildingForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/buildings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create building');
      await fetchBuildings();
      setOpen(false);
      reset();
    } catch (err) {
      console.error(err);
      alert('Failed to add building.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="700">Buildings</Typography>
          <Typography variant="body1" color="textSecondary">Manage organizational buildings and floor plans.</Typography>
        </Box>
        {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Add Building
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {buildings.map((building) => (
          <Grid item xs={12} sm={6} md={4} key={building.id}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', borderRadius: 2 }}>
                    <BuildingIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      {building.buildingName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Bldg #{building.buildingNumber}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Total Floors</Typography>
                    <Typography variant="body2" fontWeight="600">{building.totalFloors}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Total Resources</Typography>
                    <Typography variant="body2" fontWeight="600">{building._count.resources}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
              <Box sx={{ px: 2, py: 1, textAlign: 'center' }}>
                 <Button fullWidth variant="text" size="small">View Details</Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Building</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Building Name"
              {...register('buildingName')}
              error={!!errors.buildingName}
              helperText={errors.buildingName?.message}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Building Number"
              {...register('buildingNumber')}
              error={!!errors.buildingNumber}
              helperText={errors.buildingNumber?.message}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Total Floors"
              type="number"
              {...register('totalFloors')}
              error={!!errors.totalFloors}
              helperText={errors.totalFloors?.message}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

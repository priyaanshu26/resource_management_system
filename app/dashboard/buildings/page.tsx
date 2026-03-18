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
  Avatar,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import { useAuth } from '@/lib/AuthContext';
import BuildingIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
  totalFloors: z.string().min(1, 'Total floors is required')
});

type BuildingForm = z.infer<typeof buildingSchema>;

export default function BuildingsPage() {
  const { token, user } = useAuth();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BuildingForm>({
    resolver: zodResolver(buildingSchema),
    defaultValues: {
      buildingName: '',
      buildingNumber: '',
      totalFloors: ''
    }
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

  const handleEditOpen = (building: Building) => {
    setEditingBuilding(building);
    reset({
      buildingName: building.buildingName,
      buildingNumber: building.buildingNumber,
      totalFloors: building.totalFloors.toString()
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this building? This may fail if resources are attached.')) return;
    try {
      const response = await fetch(`/api/buildings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete building');
      await fetchBuildings();
    } catch (err: any) {
      alert(err.message || 'Deletion failed.');
    }
  };

  const onSubmit = async (data: BuildingForm) => {
    setIsSubmitting(true);
    try {
      const url = editingBuilding ? `/api/buildings/${editingBuilding.id}` : '/api/buildings';
      const method = editingBuilding ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          totalFloors: parseInt(data.totalFloors)
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save building');
      await fetchBuildings();
      setOpen(false);
      setEditingBuilding(null);
      reset();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save building.');
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
          <Grid key={building.id} size={{ xs: 12, sm: 6, md: 4 }}>
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
                  {isAdmin && (
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => handleEditOpen(building)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(building.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Total Floors</Typography>
                    <Typography variant="body2" fontWeight="600">{building.totalFloors}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Total Resources</Typography>
                    <Typography variant="body2" fontWeight="600">{building._count.resources}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => { setOpen(false); setEditingBuilding(null); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingBuilding ? 'Update Building' : 'Add New Building'}</DialogTitle>
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
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (editingBuilding ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress, 
  Alert,
  Avatar,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import { useAuth } from '@/lib/AuthContext';
import FacilityIcon from '@mui/icons-material/HomeRepairService';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface Facility {
  id: number;
  facilityName: string;
  details: string | null;
  resourceId: number;
  resource: { resourceName: string };
}

interface Resource {
  id: number;
  resourceName: string;
}

const facilitySchema = z.object({
  facilityName: z.string().min(1, 'Facility name is required'),
  resourceId: z.string().min(1, 'Resource is required'),
  details: z.string().nullable(),
});

type FacilityForm = z.infer<typeof facilitySchema>;

export default function FacilitiesPage() {
  const { token, user } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FacilityForm>({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      facilityName: '',
      resourceId: '',
      details: '',
    }
  });

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (token) {
      fetchFacilities();
      fetchResources();
    }
  }, [token]);

  const fetchFacilities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/facilities', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch facilities');
      const data = await response.json();
      setFacilities(data.facilities || []);
    } catch (err) {
      console.error(err);
      setError('Could not load facilities data.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources', {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      setResources(data.resources || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditOpen = (fac: Facility) => {
    setEditingFacility(fac);
    reset({
      facilityName: fac.facilityName,
      resourceId: fac.resourceId.toString(),
      details: fac.details || ''
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this facility?')) return;
    try {
      const response = await fetch(`/api/facilities/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete');
      await fetchFacilities();
    } catch (err: any) { alert(err.message); }
  };

  const onSubmit = async (data: FacilityForm) => {
    setIsSubmitting(true);
    try {
      const url = editingFacility ? `/api/facilities/${editingFacility.id}` : '/api/facilities';
      const method = editingFacility ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
           ...data,
           resourceId: parseInt(data.resourceId)
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Operation failed');
      await fetchFacilities();
      setOpen(false);
      setEditingFacility(null);
      reset();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Operation failed.');
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
           <Typography variant="h4" fontWeight="700">Facilities & Amenities</Typography>
           <Typography variant="body1" color="textSecondary">Manage organizational assets and resources attachments.</Typography>
        </Box>
        {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => { setEditingFacility(null); reset(); setOpen(true); }}
            sx={{ borderRadius: 2 }}
          >
            Add Facility
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={2}>
         {facilities.map((fac) => (
           <Grid key={fac.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
                 <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                       <Avatar sx={{ bgcolor: 'info.main', borderRadius: 2 }}>
                          <FacilityIcon />
                       </Avatar>
                       <Box sx={{ flexGrow: 1 }}>
                         <Typography variant="h6" fontWeight="600">{fac.facilityName}</Typography>
                         <Typography variant="caption" color="textSecondary">{fac.resource.resourceName}</Typography>
                       </Box>
                       {isAdmin && (
                         <Box>
                           <IconButton size="small" onClick={() => handleEditOpen(fac)}><EditIcon fontSize="small" /></IconButton>
                           <IconButton size="small" color="error" onClick={() => handleDelete(fac.id)}><DeleteIcon fontSize="small" /></IconButton>
                         </Box>
                       )}
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ 
                      minHeight: '2.5rem', 
                      display: '-webkit-box', 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: 'vertical', 
                      overflow: 'hidden'
                    }}>
                       {fac.details || 'No detailed description.'}
                    </Typography>
                 </CardContent>
              </Card>
           </Grid>
         ))}
      </Grid>

      <Dialog open={open} onClose={() => { setOpen(false); setEditingFacility(null); reset(); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingFacility ? 'Update Facility' : 'Add New Facility'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              select
              margin="normal"
              fullWidth
              label="Attach to Resource"
              {...register('resourceId')}
              error={!!errors.resourceId}
              helperText={errors.resourceId?.message}
            >
               {resources.map(res => (
                 <MenuItem key={res.id} value={res.id.toString()}>{res.resourceName}</MenuItem>
               ))}
            </TextField>
            <TextField
              margin="normal"
              fullWidth
              label="Facility Name"
              {...register('facilityName')}
              error={!!errors.facilityName}
              helperText={errors.facilityName?.message}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Description"
              multiline
              rows={3}
              {...register('details')}
              error={!!errors.details}
              helperText={errors.details?.message}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setOpen(false); setEditingFacility(null); reset(); }}>Cancel</Button>
           <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
             {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (editingFacility ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

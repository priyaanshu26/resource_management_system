'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText, 
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
  TextField,
  MenuItem,
  IconButton,
  FormControlLabel,
  Switch,
  Tooltip
} from '@mui/material';
import { useAuth } from '@/lib/AuthContext';
import ResourceIcon from '@mui/icons-material/Inventory';
import BuildingIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface Resource {
  id: number;
  resourceName: string;
  resourceTypeId: number;
  buildingId: number;
  floorNumber: number;
  description: string | null;
  requiresApproval: boolean;
  resourceType: { typeName: string };
  building: { buildingName: string; buildingNumber: string };
  _count: { facilities: number; cupboards: number; bookings: number };
}

const resourceSchema = z.object({
  resourceName: z.string().min(2, 'Name is required'),
  resourceTypeId: z.string().min(1, 'Type is required'),
  buildingId: z.string().min(1, 'Building is required'),
  floorNumber: z.string().min(1, 'Floor number is required'),
  description: z.string().optional(),
  requiresApproval: z.boolean().optional(),
});

type ResourceForm = z.infer<typeof resourceSchema>;

export default function ResourcesPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [resourceTypes, setResourceTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ResourceForm>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      resourceName: '',
      resourceTypeId: '',
      buildingId: '',
      floorNumber: '',
      description: '',
      requiresApproval: true
    }
  });

  useEffect(() => {
    if (token) {
      fetchResources();
      fetchBuildings();
      fetchResourceTypes();
    }
  }, [token]);

  const fetchBuildings = async () => {
    try {
      const response = await fetch('/api/buildings', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setBuildings(data.buildings || []);
    } catch (err) { console.error(err); }
  };

  const fetchResourceTypes = async () => {
    try {
      const response = await fetch('/api/resource-types', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setResourceTypes(data.resourceTypes || []);
    } catch (err) { console.error(err); }
  };

  const fetchResources = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/resources', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      setResources(data.resources || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Could not load data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditOpen = (resource: Resource) => {
    setEditingResource(resource);
    reset({
      resourceName: resource.resourceName,
      resourceTypeId: resource.resourceTypeId.toString(),
      buildingId: resource.buildingId.toString(),
      floorNumber: resource.floorNumber.toString(),
      description: resource.description || '',
      requiresApproval: resource.requiresApproval
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource? All associated bookings will be affected.')) return;
    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete');
      await fetchResources();
    } catch (err: any) { alert(err.message || 'Deletion failed.'); }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const url = editingResource ? `/api/resources/${editingResource.id}` : '/api/resources';
      const method = editingResource ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...data,
          resourceTypeId: parseInt(data.resourceTypeId),
          buildingId: parseInt(data.buildingId),
          floorNumber: parseInt(data.floorNumber)
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save');
      await fetchResources();
      setOpen(false);
      setEditingResource(null);
      reset();
    } catch (err: any) { alert(err.message || 'Operation failed.'); }
    finally { setIsSubmitting(false); }
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="700">Resources Overview</Typography>
            <Typography variant="body1" color="textSecondary">Manage organizational assets and rooms.</Typography>
        </Box>
        {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Add Resource
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : resources.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="textSecondary">No resources found.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {resources.map((resource) => (
            <Grid key={resource.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
                <CardContent sx={{ pb: 1 }}>
                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', p: 1, borderRadius: 1 }}>
                       <ResourceIcon color="primary" />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={resource.resourceType.typeName}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                      />
                      {isAdmin && (
                        <Box sx={{ display: 'flex' }}>
                          <IconButton size="small" onClick={() => handleEditOpen(resource)}><EditIcon fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(resource.id)}><DeleteIcon fontSize="small" /></IconButton>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Typography gutterBottom variant="h6" component="h2" fontWeight="600">
                    {resource.resourceName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BuildingIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      {resource.building?.buildingName} (Bldg {resource.building?.buildingNumber}), Floor {resource.floorNumber}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{
                    minHeight: '2.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 2
                  }}>
                    {resource.description || 'No description available.'}
                  </Typography>
                </CardContent>
                <Divider />
                <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-around', bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary">Facilities</Typography>
                    <Typography variant="body2" fontWeight="600">{resource._count.facilities}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary">Cupboards</Typography>
                    <Typography variant="body2" fontWeight="600">{resource._count.cupboards}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary">Bookings</Typography>
                    <Typography variant="body2" fontWeight="600">{resource._count.bookings}</Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
       <Dialog open={open} onClose={() => { setOpen(false); setEditingResource(null); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingResource ? 'Update Resource' : 'Add New Resource'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Resource Name"
              {...register('resourceName')}
              error={!!errors.resourceName}
              helperText={errors.resourceName?.message}
            />
            <TextField
              select
              margin="normal"
              fullWidth
              label="Resource Type"
              {...register('resourceTypeId')}
              error={!!errors.resourceTypeId}
              helperText={errors.resourceTypeId?.message}
            >
               {resourceTypes.map(type => (
                 <MenuItem key={type.id} value={type.id.toString()}>{type.typeName}</MenuItem>
               ))}
            </TextField>
            <TextField
              select
              margin="normal"
              fullWidth
              label="Building"
              {...register('buildingId')}
              error={!!errors.buildingId}
              helperText={errors.buildingId?.message}
            >
               {buildings.map(b => (
                 <MenuItem key={b.id} value={b.id.toString()}>{b.buildingName}</MenuItem>
               ))}
            </TextField>
            <TextField
              margin="normal"
              fullWidth
              type="number"
              label="Floor Number"
              {...register('floorNumber')}
              error={!!errors.floorNumber}
              helperText={errors.floorNumber?.message}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Description"
              multiline
              rows={2}
              {...register('description')}
            />
            <FormControlLabel
              control={<Switch {...register('requiresApproval')} defaultChecked />}
              label="Requires Approval"
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setOpen(false); reset(); setEditingResource(null); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
             {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (editingResource ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

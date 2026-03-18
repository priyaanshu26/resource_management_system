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
  Chip,
  Avatar,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import MaintenanceIcon from '@mui/icons-material/Build';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { useAuth } from '@/lib/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface Maintenance {
  id: number;
  maintenanceType: string;
  scheduledDate: string;
  completionDate: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  resource: { id: number; resourceName: string; building: { buildingName: string } };
}

interface Resource {
  id: number;
  resourceName: string;
}

const maintenanceSchema = z.object({
  resourceId: z.string().min(1, 'Resource is required'),
  maintenanceType: z.string().min(1, 'Type is required'),
  scheduledDate: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

type MaintenanceForm = z.infer<typeof maintenanceSchema>;

export default function MaintenancePage() {
  const { token, user } = useAuth();
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const role = user?.role;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MaintenanceForm>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      resourceId: '',
      maintenanceType: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      notes: '',
      status: 'SCHEDULED'
    }
  });

  useEffect(() => {
    if (token) {
      fetchMaintenance();
      fetchResources();
    }
  }, [token]);

  const fetchMaintenance = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/maintenance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch maintenance');
      const data = await response.json();
      setMaintenance(data.maintenance || []);
    } catch (err) {
      console.error(err);
      setError('Could not load maintenance logs.');
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

  const handleEditOpen = (m: Maintenance) => {
    setEditingMaintenance(m);
    reset({
      resourceId: m.resource.id.toString(),
      maintenanceType: m.maintenanceType,
      scheduledDate: new Date(m.scheduledDate).toISOString().split('T')[0],
      notes: m.notes || '',
      status: m.status
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this maintenance record?')) return;
    try {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete');
      await fetchMaintenance();
    } catch (err: any) { alert(err.message); }
  };

  const handleQuickStatus = async (m: Maintenance, newStatus: string) => {
    if (!confirm(`Confirm change to ${newStatus}?`)) return;
    try {
      const resp = await fetch(`/api/maintenance/${m.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          status: newStatus,
          maintenanceType: m.maintenanceType,
          scheduledDate: m.scheduledDate,
          resourceId: m.resource.id.toString()
        })
      });
      if (resp.ok) await fetchMaintenance();
    } catch (err) {}
  };

  const onSubmit = async (data: MaintenanceForm) => {
    setIsSubmitting(true);
    try {
      const url = editingMaintenance ? `/api/maintenance/${editingMaintenance.id}` : '/api/maintenance';
      const method = editingMaintenance ? 'PUT' : 'POST';

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
      if (!response.ok) throw new Error(result.error || 'Maintenance update failed');
      await fetchMaintenance();
      setOpen(false);
      setEditingMaintenance(null);
      reset();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: Maintenance['status']) => {
    switch(status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'info';
      case 'SCHEDULED': return 'warning';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  if (role === 'STUDENT') {
    return (
       <Container sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h5" color="error">Access Denied</Typography>
          <Typography variant="body1">Only staff members can view or manage maintenance records.</Typography>
       </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
           <Typography variant="h4" fontWeight="700">Maintenance Oversight</Typography>
           <Typography variant="body1" color="textSecondary">Track and schedule repairs across all organization facilities.</Typography>
        </Box>
         {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => { setOpen(true); setEditingMaintenance(null); reset({ scheduledDate: new Date().toISOString().split('T')[0] }); }}
            sx={{ borderRadius: 2 }}
          >
            Schedule Maintenance
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2}>
            {maintenance.map((m) => (
          <Grid key={m.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column', border: '1px solid #e0e0e0', transition: 'all 0.3s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', borderRadius: 2 }}>
                    <MaintenanceIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="600">{m.maintenanceType}</Typography>
                    <Typography variant="caption" color="textSecondary">{m.resource.resourceName} • {m.resource.building.buildingName}</Typography>
                  </Box>
                  <Box>
                    <Tooltip title="View/Edit Details">
                      <IconButton size="small" onClick={() => handleEditOpen(m)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    {isAdmin && (
                      <Tooltip title="Delete Maintenance">
                        <IconButton size="small" color="error" onClick={() => handleDelete(m.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                   <Chip size="small" label={m.status} color={getStatusColor(m.status)} sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                   <Typography variant="caption" color="textSecondary">{new Date(m.scheduledDate).toLocaleDateString()}</Typography>
                </Box>

                {m.notes && (
                    <Box sx={{ mt: 1, mb: 2, p: 1.5, borderRadius: 2, bgcolor: '#f8f9fa' }}>
                        <Typography variant="caption" color="textSecondary" display="block">Task Notes:</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{m.notes}</Typography>
                    </Box>
                )}

                {!['COMPLETED', 'CANCELLED'].includes(m.status) && (
                   <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #eee', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {m.status === 'SCHEDULED' && (
                        <Button variant="contained" size="small" color="info" fullWidth onClick={() => handleQuickStatus(m, 'IN_PROGRESS')}>Start Job</Button>
                      )}
                      {(m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS') && (
                        <Button variant="contained" size="small" color="success" sx={{ flexGrow: 1 }} onClick={() => handleQuickStatus(m, 'COMPLETED')}>Complete</Button>
                      )}
                      {(m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS') && (
                        <Button variant="outlined" size="small" color="error" sx={{ flexGrow: 1 }} onClick={() => handleQuickStatus(m, 'CANCELLED')}>Cancel</Button>
                      )}
                      {isAdmin && m.status !== 'SCHEDULED' && (
                         <Button variant="text" size="small" fullWidth onClick={() => handleQuickStatus(m, 'SCHEDULED')}>Back to Scheduled</Button>
                      )}
                   </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
           ))}
        </Grid>
      )}

       <Dialog open={open} onClose={() => { setOpen(false); setEditingMaintenance(null); reset(); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingMaintenance ? 'Update Maintenance' : 'New Maintenance'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              select
              margin="normal"
              fullWidth
              label="Resource"
              {...register('resourceId')}
              disabled={!isAdmin}
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
              label="Maintenance Type"
              {...register('maintenanceType')}
              disabled={!isAdmin}
              error={!!errors.maintenanceType}
            />
            {editingMaintenance && (
               <TextField
                 select
                 margin="normal"
                 fullWidth
                 label="Status"
                 {...register('status')}
               >
                 <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                 <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                 <MenuItem value="COMPLETED">Completed</MenuItem>
                 <MenuItem value="CANCELLED">Cancelled</MenuItem>
               </TextField>
            )}
            <TextField
              margin="normal"
              fullWidth
              label="Scheduled Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...register('scheduledDate')}
              disabled={!isAdmin}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Notes"
              multiline
              rows={3}
              {...register('notes')}
              disabled={!isAdmin}
             />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setOpen(false); setEditingMaintenance(null); reset(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
             Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

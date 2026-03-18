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
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Badge
} from '@mui/material';
import { useAuth } from '@/lib/AuthContext';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CancelIcon from '@mui/icons-material/Cancel';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface Booking {
  id: number;
  startDatetime: string;
  endDatetime: string;
  purpose: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  resource: { resourceName: string; building: { buildingName: string } };
  user: { name: string; email: string };
  approver?: { name: string };
}

interface Resource {
  id: number;
  resourceName: string;
}

const bookingSchema = z.object({
  resourceId: z.string().min(1, 'Resource is required'),
  startDatetime: z.string().min(1, 'Start time is required'),
  endDatetime: z.string().min(1, 'End time is required'),
  purpose: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

export default function BookingsPage() {
  const { token, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  });

  useEffect(() => {
    if (token) {
      fetchBookings();
      fetchResources();
    }
  }, [token]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
      setError('Could not load bookings.');
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

  const onSubmit = async (data: BookingForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create booking');
      
      await fetchBookings();
      setOpen(false);
      reset();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to add booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch(status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch(status) {
      case 'APPROVED': return <CheckCircleIcon sx={{ fontSize: '1rem' }} />;
      case 'PENDING': return <PendingActionsIcon sx={{ fontSize: '1rem' }} />;
      default: return <CancelIcon sx={{ fontSize: '1rem' }} />;
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
          <Typography variant="h4" fontWeight="700">Bookings</Typography>
          <Typography variant="body1" color="textSecondary">{isAdmin ? 'Track and manage all system bookings.' : 'Manage your resource reservations.'}</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          New Booking
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {bookings.map((booking) => (
          <Grid item xs={12} key={booking.id}>
            <Card sx={{ borderRadius: 3, transition: 'all 0.3s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <Avatar sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', color: 'primary.main', borderRadius: 2 }}>
                       <EventNoteIcon />
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                       <Typography variant="h6" fontWeight="600" sx={{ lineHeight: 1.2 }}>
                        {booking.resource.resourceName}
                      </Typography>
                      <Chip 
                        label={booking.status} 
                        size="small" 
                        color={getStatusColor(booking.status)}
                        icon={getStatusIcon(booking.status)}
                        sx={{ fontSize: '0.65rem', fontWeight: 700, height: 20 }}
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {booking.resource.building.buildingName} • {new Date(booking.startDatetime).toLocaleString()} - {new Date(booking.endDatetime).toLocaleTimeString()}
                    </Typography>
                    {isAdmin && (
                       <Typography variant="caption" sx={{ mt: 0.5, display: 'block', fontWeight: 500 }}>
                        Requested by: {booking.user.name} ({booking.user.email})
                      </Typography>
                    )}
                  </Grid>
                  <Grid item>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                       {booking.status === 'PENDING' && isAdmin && (
                         <Button variant="outlined" color="success" size="small">Approve</Button>
                       )}
                       <Button variant="text" size="small" color="inherit">Details</Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>New Resource Booking</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              select
              margin="normal"
              fullWidth
              label="Select Resource"
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
              label="Start Date Time"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              {...register('startDatetime')}
              error={!!errors.startDatetime}
              helperText={errors.startDatetime?.message}
            />
            <TextField
              margin="normal"
              fullWidth
              label="End Date Time"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              {...register('endDatetime')}
              error={!!errors.endDatetime}
              helperText={errors.endDatetime?.message}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Purpose / Notes"
              multiline
              rows={3}
              {...register('purpose')}
              error={!!errors.purpose}
              helperText={errors.purpose?.message}
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
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

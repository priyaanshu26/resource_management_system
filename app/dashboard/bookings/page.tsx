'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, Container, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Avatar, Tooltip, IconButton
} from '@mui/material';
import { useAuth } from '@/lib/AuthContext';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDateTime } from '@/lib/formatters';
import { format } from 'date-fns';

interface Booking {
  id: number;
  startDatetime: string;
  endDatetime: string;
  purpose: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  resource: { resourceName: string; building: { buildingName: string } };
  user: { name: string; email: string };
}

const bookingSchema = z.object({
  resourceId: z.string().min(1, 'Resource is required'),
  startDatetime: z.string().min(1, 'Start time is required'),
  endDatetime: z.string().min(1, 'End time is required'),
  purpose: z.string().optional(),
});

export default function BookingsPage() {
  const { token, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const getDefaultDates = () => {
    const start = new Date();
    start.setMinutes(start.getMinutes() - start.getTimezoneOffset());
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return {
      start: start.toISOString().slice(0, 16),
      end: end.toISOString().slice(0, 16)
    };
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      resourceId: '',
      startDatetime: getDefaultDates().start,
      endDatetime: getDefaultDates().end,
      purpose: ''
    }
  });

  const handleOpenNew = () => {
    reset({
      resourceId: '',
      startDatetime: getDefaultDates().start,
      endDatetime: getDefaultDates().end,
      purpose: ''
    });
    setOpen(true);
  };

  useEffect(() => {
    if (token) { fetchBookings(); fetchResources(); }
  }, [token]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bookings', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setBookings(data.bookings || []);
    } finally { setIsLoading(false); }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setResources(data.resources || []);
    } catch (err) {}
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const resp = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...data, resourceId: parseInt(data.resourceId) }),
      });
      if (resp.ok) { await fetchBookings(); setOpen(false); reset(); }
    } finally { setIsSubmitting(false); }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchBookings();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this booking?')) {
      await fetch(`/api/bookings/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      fetchBookings();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" fontWeight="700">Bookings</Typography>
        <Button variant="contained" onClick={handleOpenNew}>New Booking</Button>
      </Box>
      <Grid container spacing={3}>
        {bookings.map((booking) => (
          <Grid key={booking.id} size={{ xs: 12 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.light' }}><EventNoteIcon /></Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{booking.resource.resourceName}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatDateTime(booking.startDatetime)} - {format(new Date(booking.endDatetime), 'HH:mm')}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                      Created by: {booking.user.name} ({booking.user.email})
                    </Typography>
                  </Box>
                  <Chip label={booking.status} color={booking.status === 'APPROVED' ? 'success' : 'warning'} />
                  {isAdmin && booking.status === 'PENDING' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="contained" color="success" onClick={() => handleStatusUpdate(booking.id, 'APPROVED')}>Approve</Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => handleStatusUpdate(booking.id, 'REJECTED')}>Reject</Button>
                    </Box>
                  )}
                  {isAdmin && (
                    <IconButton color="error" onClick={() => handleDelete(booking.id)}><DeleteIcon /></IconButton>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>New Booking</DialogTitle>
        <DialogContent>
          <TextField select fullWidth margin="normal" label="Resource" {...register('resourceId')} error={!!errors.resourceId} helperText={errors.resourceId?.message as string}>
            {resources.map(r => <MenuItem key={r.id} value={r.id.toString()}>{r.resourceName}</MenuItem>)}
          </TextField>
          <TextField fullWidth margin="normal" type="datetime-local" label="Start" {...register('startDatetime')} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth margin="normal" type="datetime-local" label="End" {...register('endDatetime')} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth margin="normal" multiline rows={2} label="Purpose" {...register('purpose')} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Avatar, 
  Chip, 
  IconButton, 
  CircularProgress, 
  Alert,
  Tooltip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuth } from '@/lib/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const userSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'EMPLOYEE', 'STUDENT']),
});

type UserForm = z.infer<typeof userSchema>;

export default function UsersPage() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'STUDENT'
    }
  });

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      setError('Could not load users database.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UserForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add user');
      await fetchUsers();
      setOpen(false);
      reset();
    } catch (err) {
      console.error(err);
      alert('Failed to add user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Access Denied</Typography>
        <Typography variant="body1">You don't have permission to manage users.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
           <Typography variant="h4" fontWeight="700">Manage Users</Typography>
           <Typography variant="body1" color="textSecondary">View and maintain all organizational accounts.</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />}
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Add User
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Member Since</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={5} padding="none">
                    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
                 </TableCell>
               </TableRow>
            ) : users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="600">{user.name}</Typography>
                      <Typography variant="caption" color="textSecondary">{user.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    size="small" 
                    sx={{ 
                      borderRadius: 1, 
                      fontWeight: 600, 
                      fontSize: '0.7rem',
                      bgcolor: user.role === 'ADMIN' ? 'error.light' : (user.role === 'EMPLOYEE' ? 'info.light' : 'success.light'),
                      color: user.role === 'ADMIN' ? 'error.dark' : (user.role === 'EMPLOYEE' ? 'info.dark' : 'success.dark')
                    }} 
                  />
                </TableCell>
                <TableCell>#{user.id}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                   <Tooltip title="Edit User">
                     <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                   </Tooltip>
                   <Tooltip title="Delete User">
                     <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                   </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New User Account</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Full Name"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Email Address"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Password"
              type="password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <TextField
              select
              margin="normal"
              fullWidth
              label="User Role"
              {...register('role')}
              error={!!errors.role}
              helperText={errors.role?.message}
              defaultValue="STUDENT"
            >
               <MenuItem value="ADMIN">Admin</MenuItem>
               <MenuItem value="EMPLOYEE">Employee</MenuItem>
               <MenuItem value="STUDENT">Student</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

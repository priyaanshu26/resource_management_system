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
  const [editingUser, setEditingUser] = useState<User | null>(null);
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

  const handleEditOpen = (user: User) => {
    setEditingUser(user);
    reset({
      name: user.name,
      email: user.email,
      role: user.role as any,
      password: '' // Keep empty for no change
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (id === currentUser?.id) {
       alert('You cannot delete your own account.');
       return;
    }
    if (!confirm('Are you sure you want to remove this user? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete');
      }
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Deletion failed.');
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/auth/register';
      const method = editingUser ? 'PUT' : 'POST';
      
      const payload = { ...data };
      if (editingUser && !payload.password) {
        delete payload.password; // Don't send empty password if editing
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to process request');
      
      await fetchUsers();
      setOpen(false);
      setEditingUser(null);
      reset();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Operation failed.');
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
                      <IconButton size="small" onClick={() => handleEditOpen(user)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton size="small" color="error" onClick={() => handleDelete(user.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                 </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

       <Dialog open={open} onClose={() => { setOpen(false); setEditingUser(null); }} maxWidth="xs" fullWidth>
         <DialogTitle sx={{ fontWeight: 700 }}>{editingUser ? 'Update User Account' : 'Add New User Account'}</DialogTitle>
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
               label={editingUser ? "Password (leave blank for no change)" : "Password"}
               type="password"
               {...register('password', { required: !editingUser })}
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
             {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (editingUser ? 'Update User' : 'Create User')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import { useAuth } from '@/lib/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        login(result.user, result.token);
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection refused. Please make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            width: '100%', 
            borderRadius: 3, 
            border: '1px solid #e0e0e0',
            backgroundColor: '#ffffff'
          }}
        >
          <Typography component="h1" variant="h5" align="center" gutterBottom fontWeight="600" color="primary">
            Resource Management
          </Typography>
          <Typography component="h2" variant="body1" align="center" color="textSecondary" sx={{ mb: 3 }}>
            Sign in to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              autoFocus
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              size='medium'
              variant='outlined'
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              size='medium'
              variant='outlined'
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                borderRadius: 2
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

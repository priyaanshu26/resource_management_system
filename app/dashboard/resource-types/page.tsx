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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '@/lib/AuthContext';

interface ResourceType {
  id: number;
  typeName: string;
  description: string | null;
}

export default function ResourceTypesPage() {
  const { token, user } = useAuth();
  const [types, setTypes] = useState<ResourceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ typeName: '', description: '' });

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (token) {
      fetchTypes();
    }
  }, [token]);

  const fetchTypes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/resource-types', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch resource types');
      const data = await response.json();
      setTypes(data.resourceTypes || []);
    } catch (err) {
      console.error(err);
      setError('Could not load categorization data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const response = await fetch('/api/resource-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Failed to create resource type');
      await fetchTypes();
      setOpen(false);
      setForm({ typeName: '', description: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to add category.');
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
           <Typography variant="h4" fontWeight="700">Resource Classification</Typography>
           <Typography variant="body1" color="textSecondary">Define and manage categories for organization assets.</Typography>
        </Box>
        {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Add Category
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {types.map((type) => (
          <Grid key={type.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%', borderRadius: 3, transition: 'all 0.3s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(156, 39, 176, 0.1)', color: 'secondary.main', borderRadius: 2 }}>
                    <CategoryIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      {type.typeName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      ID #{type.id}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="textSecondary" sx={{ 
                  minHeight: '3rem', 
                  display: '-webkit-box', 
                  WebkitLineClamp: 3, 
                  WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden'
                }}>
                  {type.description || 'No detailed description for this category.'}
                </Typography>
              </CardContent>
              {isAdmin && (
                <Box sx={{ px: 2, pb: 1, textAlign: 'right' }}>
                   <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Resource Category</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Category Name"
              placeholder="e.g. Lab, Auditorium, Classroom"
              value={form.typeName}
              onChange={(e) => setForm({ ...form, typeName: e.target.value })}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

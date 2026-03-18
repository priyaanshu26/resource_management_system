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
  Paper
} from '@mui/material';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import ResourceIcon from '@mui/icons-material/Inventory';
import BuildingIcon from '@mui/icons-material/Business';

interface Resource {
  id: number;
  resourceName: string;
  floorNumber: number;
  description: string | null;
  resourceType: { typeName: string };
  building: { buildingName: string; buildingNumber: string };
  _count: { facilities: number; cupboards: number; bookings: number };
}

export default function Dashboard() {
  const { token, isLoading: authLoading } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchResources();
    }
  }, [token]);

  const fetchResources = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/resources', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }

      const data = await response.json();
      setResources(data.resources || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Could not load data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="700">
            Resources Overview
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage and view all available resources across the campus.
          </Typography>
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
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', p: 1, borderRadius: 1 }}>
                         <ResourceIcon color="primary" />
                      </Box>
                      <Chip 
                        label={resource.resourceType.typeName} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                      />
                    </Box>
                    <Typography gutterBottom variant="h6" component="h2" fontWeight="600">
                      {resource.resourceName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BuildingIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                      <Typography variant="body2" color="textSecondary">
                        {resource.building.buildingName} (Bldg {resource.building.buildingNumber}), Floor {resource.floorNumber}
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
      </Container>
    </Box>
  );
}

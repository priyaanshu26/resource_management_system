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
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import { useAuth } from '@/lib/AuthContext';
import ResourceIcon from '@mui/icons-material/Inventory';
import BookingsIcon from '@mui/icons-material/EventNote';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useRouter } from 'next/navigation';

interface Stats {
  totalResources: number;
  myBookings: number;
  totalBookings?: number;
  pendingApprovals?: number;
  totalUsers?: number;
  upcomingBookings: any[];
  recentBookings?: any[];
}

export default function DashboardOverview() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
      <CircularProgress />
    </Box>
  );

  const isAdmin = user?.role === 'ADMIN';

  const statCards = [
    { title: 'Total Resources', value: stats?.totalResources || 0, icon: <ResourceIcon />, color: '#1976d2', path: '/dashboard/resources' },
    { title: isAdmin ? 'Total Bookings' : 'My Bookings', value: isAdmin ? (stats?.totalBookings || 0) : (stats?.myBookings || 0), icon: <BookingsIcon />, color: '#2e7d32', path: '/dashboard/bookings' },
    { title: isAdmin ? 'Pending Approvals' : 'Upcoming Bookings', value: isAdmin ? (stats?.pendingApprovals || 0) : (stats?.upcomingBookings.length || 0), icon: isAdmin ? <TrendingUpIcon /> : <HistoryIcon />, color: '#ed6c02', path: '/dashboard/bookings' },
    { title: 'System Users', value: stats?.totalUsers || 0, icon: <PeopleIcon />, color: '#9c27b0', path: '/dashboard/users', hide: !isAdmin },
  ].filter(card => !card.hide);

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
        Welcome back, {user?.name}!
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Here's what's happening in the system today.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={isAdmin ? 3 : 4} key={index}>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }
              }}
              onClick={() => router.push(stat.path)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, borderRadius: 2 }}>
                  {stat.icon}
                </Avatar>
                <Typography variant="h4" fontWeight="700">{stat.value}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" fontWeight="500">
                {stat.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={isAdmin ? 7 : 12}>
          <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="600">
                {isAdmin ? 'Recent Bookings' : 'Your Upcoming Bookings'}
              </Typography>
              <Button size="small" onClick={() => router.push('/dashboard/bookings')}>View All</Button>
            </Box>
            <Divider />
            <List sx={{ p: 0 }}>
              {(isAdmin ? stats?.recentBookings : stats?.upcomingBookings)?.slice(0, 5).map((booking: any) => (
                <ListItem key={booking.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', color: 'primary.main' }}>
                      <BookingsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={booking.resource.resourceName}
                    secondary={`${new Date(booking.startDatetime).toLocaleString()} - ${isAdmin ? `by ${booking.user.name}` : booking.status}`}
                  />
                </ListItem>
              ))}
              {((isAdmin ? stats?.recentBookings : stats?.upcomingBookings)?.length === 0) && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">No bookings to show.</Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>

        {isAdmin && (
          <Grid item xs={12} md={5}>
             <Paper sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', bgcolor: 'primary.main', color: '#ffffff' }}>
                <Typography variant="h5" fontWeight="700" gutterBottom>Administrative Control</Typography>
                <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                  You have full access to manage buildings, users, and resources. Use the sidebar to navigate to specific sections.
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ bgcolor: '#ffffff', color: 'primary.main', fontWeight: 600, '&:hover': { bgcolor: '#f5f5f5' } }}
                  onClick={() => router.push('/dashboard/resources')}
                >
                  Manage Resources
                </Button>
             </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

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
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { useAuth } from '@/lib/AuthContext';
import ResourceIcon from '@mui/icons-material/Inventory';
import BookingsIcon from '@mui/icons-material/EventNote';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useRouter } from 'next/navigation';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface Stats {
  totalResources: number;
  myBookings: number;
  totalBookings?: number;
  approvedBookings?: number; // Added
  pendingApprovals?: number;
  totalUsers?: number;
  activeMaintenance?: number; // Added
  upcomingBookings: any; 
  recentBookings?: any[];
  usageHistory?: any[];
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
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  const isAdmin = user?.role === 'ADMIN';
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#1976d2', '#82ca9d'];

  const statCards = [
    { title: 'Resources', value: stats?.totalResources || 0, icon: <ResourceIcon />, color: '#1976d2', path: '/dashboard/resources' },
    { title: isAdmin ? 'Total Bookings' : 'My Bookings', value: isAdmin ? (stats?.totalBookings || 0) : (stats?.myBookings || 0), icon: <BookingsIcon />, color: '#2e7d32', path: '/dashboard/bookings' },
    { title: isAdmin ? 'Pending Approvals' : 'Upcoming Bookings', value: isAdmin ? (stats?.pendingApprovals || 0) : (Array.isArray(stats?.upcomingBookings) ? stats?.upcomingBookings.length : (stats?.upcomingBookings || 0)), icon: isAdmin ? <TrendingUpIcon /> : <HistoryIcon />, color: '#ed6c02', path: '/dashboard/bookings' },
    { title: 'Users', value: stats?.totalUsers || 0, icon: <PeopleIcon />, color: '#9c27b0', path: '/dashboard/users', hide: !isAdmin },
  ].filter(card => !card.hide);

  return (
    <Container maxWidth="lg" sx={{ mt: 2, pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5 }}>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Welcome back, {user?.name}. Here's a snapshot of the Resource Management System.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: isAdmin ? 3 : 4 }}>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 4, 
                cursor: 'pointer',
                border: '1px solid #f0f0f0',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }
              }}
              onClick={() => router.push(stat.path)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, borderRadius: 2 }}>
                  {stat.icon}
                </Avatar>
                <Typography variant="h4" fontWeight="800">{stat.value}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                {stat.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Charts and Analytics - Admin Only */}
        {isAdmin && (
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #f0f0f0', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                   <Avatar sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', color: 'primary.main', width: 32, height: 32 }}>
                      <AssessmentIcon sx={{ fontSize: '1.2rem' }} />
                   </Avatar>
                   <Typography variant="h6" fontWeight="700">Booking Utilization Trend</Typography>
              </Box>
              <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={stats?.usageHistory || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} 
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    />
                    <Bar dataKey="bookings" fill="#1976d2" radius={[6, 6, 0, 0]} barSize={40}>
                      {(stats?.usageHistory || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Recent Activity List */}
        <Grid size={{ xs: 12, lg: isAdmin ? 4 : 12 }}>
          <Paper sx={{ p: 0, borderRadius: 4, border: '1px solid #f0f0f0', overflow: 'hidden', height: '100%' }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="700">
                {isAdmin ? 'System Activity' : 'My Schedule'}
              </Typography>
              <Button size="small" variant="text" onClick={() => router.push('/dashboard/bookings')} sx={{ fontWeight: 600 }}>Manage</Button>
            </Box>
            <Divider />
            <List sx={{ p: 0 }}>
              {(isAdmin ? stats?.recentBookings : stats?.upcomingBookings)?.slice(0, 6).map((booking: any) => (
                <ListItem key={booking.id} divider sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)', color: 'text.secondary', width: 40, height: 40 }}>
                      <BookingsIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={booking.resource.resourceName}
                    primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                    secondary={`${new Date(booking.startDatetime).toLocaleDateString()} at ${new Date(booking.startDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${isAdmin ? booking.user.name : booking.status}`}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
              {((isAdmin ? stats?.recentBookings : stats?.upcomingBookings)?.length === 0) && (
                <Box sx={{ p: 6, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>Your calendar is empty for now.</Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Administration Table - Bottom Section */}
        {isAdmin && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ mt: 1 }}>
              <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Resource Health & Utilization</Typography>
              <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#fafafa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Metric Type</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Performance</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Indicators</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { 
                        label: 'Booking Fulfillment Rate', 
                        value: stats?.totalBookings ? `${Math.round(((stats.approvedBookings || 0) / stats.totalBookings) * 100)}%` : '0%', 
                        status: stats?.totalBookings && (stats.approvedBookings || 0) / stats.totalBookings > 0.8 ? 'Excellent' : 'Stable',
                        color: 'info' 
                      },
                      { 
                        label: 'Service Continuity Index', 
                        value: '99.9%', 
                        status: (stats?.activeMaintenance || 0) > 0 ? 'Repairs in Progress' : 'Operational', 
                        color: (stats?.activeMaintenance || 0) > 0 ? 'warning' : 'success' 
                      },
                      { 
                        label: 'Active Service Requests', 
                        value: stats?.pendingApprovals || 0, 
                        status: (stats?.pendingApprovals || 0) > 5 ? 'High Volume' : 'Under Control', 
                        color: (stats?.pendingApprovals || 0) > 5 ? 'error' : 'warning' 
                      },
                      { 
                        label: 'Global Resource Footprint', 
                        value: stats?.totalResources || 0, 
                        status: 'Active', 
                        color: 'primary' 
                      },
                    ].map((row, i) => (
                      <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 600, py: 2 }}>{row.label}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>{row.value}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={row.status} 
                            color={row.color as any} 
                            size="small" 
                            variant="filled" 
                            sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: '0.65rem', textTransform: 'uppercase' }} 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

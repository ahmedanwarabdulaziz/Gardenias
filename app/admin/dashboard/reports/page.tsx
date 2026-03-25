'use client';
import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { CalendarToday, AttachMoney, TrendingUp, TrendingDown, InfoOutlined, PeopleAlt } from '@mui/icons-material';

interface ReportData {
  chartData: { day: string; revenue: number; bookings: number }[];
  recentBookings: {
     id: string;
     customerName: string;
     customerEmail: string;
     customerPhone: string;
     startAt: string;
     status: string;
  }[];
  summary: { totalRevenue: number; totalBookings: number; pastMonthRevenue: number; pastMonthBookings: number };
  currentMonth?: string;
  isDemo?: boolean;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch('/api/admin/reports');
        if (!res.ok) throw new Error('Failed to fetch reports');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          throw new Error(json.error || 'Unknown error');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  // Calculate Growth Percentages
  const revGrowth = data.summary.pastMonthRevenue === 0 
    ? 100 
    : ((data.summary.totalRevenue - data.summary.pastMonthRevenue) / data.summary.pastMonthRevenue) * 100;
  
  const bookGrowth = data.summary.pastMonthBookings === 0 
    ? 100 
    : ((data.summary.totalBookings - data.summary.pastMonthBookings) / data.summary.pastMonthBookings) * 100;

  const RenderGrowthBadge = ({ percent }: { percent: number }) => {
    // Treat effectively 0 as Neutral so we don't say +0%
    const isNeutral = Math.abs(percent) < 0.1;
    const isPositive = percent >= 0;
    
    let color = isPositive ? '#c8e6c9' : '#ffcdd2';
    let textColor = isPositive ? '#2e7d32' : '#c62828';
    
    if (isNeutral) {
      color = 'rgba(255,255,255,0.2)';
      textColor = '#fff';
    }

    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mt: 1, 
        bgcolor: color, 
        color: textColor, 
        px: 1, 
        py: 0.5, 
        borderRadius: 1, 
        width: 'max-content',
        fontSize: '0.8rem',
        fontWeight: 'bold'
      }}>
        {!isNeutral && (isPositive ? <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} /> : <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />)}
        {isNeutral ? 'No change vs last month' : `${isPositive ? '+' : ''}${percent.toFixed(1)}% vs last month`}
      </Box>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'success';
      case 'ACCEPTED': return 'primary';
      case 'PENDING': return 'warning';
      case 'DECLINED':
      case 'REJECTED':
      case 'CANCELED_BY_CUSTOMER':
      case 'CANCELED_BY_SELLER': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h4" fontWeight="fontWeightBold" mb={2}>
        Financial & Booking Reports (Current Month)
      </Typography>

      {data.isDemo && (
        <Alert icon={<InfoOutlined fontSize="inherit" />} severity="info" sx={{ mb: 4, borderRadius: 2 }}>
          <strong>No Recent Payments Found:</strong> We couldn't find any real Square transactions for {data.currentMonth}. To ensure you can see how the report looks, we've generated this visual demo data. Once real payments/bookings occur this month, this message will disappear and real metrics will take over!
        </Alert>
      )}

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, display: 'flex', borderRadius: 2, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <AttachMoney sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Revenue (MTD)</Typography>
              <Typography variant="h4">${data.summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
              <RenderGrowthBadge percent={revGrowth} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, display: 'flex', borderRadius: 2, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <CalendarToday sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Bookings (MTD)</Typography>
              <Typography variant="h4">{data.summary.totalBookings.toLocaleString()}</Typography>
              <RenderGrowthBadge percent={bookGrowth} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, display: 'flex', borderRadius: 2, background: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <TrendingUp sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
               <Typography variant="body2" sx={{ opacity: 0.9 }}>Avg Revenue / Booking</Typography>
               <Typography variant="h4">${data.summary.totalBookings > 0 ? (data.summary.totalRevenue / data.summary.totalBookings).toFixed(2) : '0.00'}</Typography>
               <Box sx={{ mt: 1, color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                 Average value per patient
               </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>



    </Box>
  );
}

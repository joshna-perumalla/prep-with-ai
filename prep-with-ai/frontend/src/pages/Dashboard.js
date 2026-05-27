import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Button, Box, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { interviewApi } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';

const StatCard = ({ icon, value, label, gradient }) => (
  <Paper sx={{
    p: 3, textAlign: 'center', position: 'relative', overflow: 'hidden',
    '&::before': {
      content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3,
      background: gradient,
    },
  }}>
    <Box sx={{
      width: 52, height: 52, borderRadius: 3, mx: 'auto', mb: 2,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: gradient, opacity: 0.9,
    }}>
      {icon}
    </Box>
    <Typography variant="h3" fontWeight={800} color="text.primary">{value}</Typography>
    <Typography color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
  </Paper>
);

export default function Dashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [sessions, setSessions] = useState(null);
  const navigate = useNavigate();
  const name = localStorage.getItem('userName') || 'User';

  useEffect(() => {
    interviewApi.getHistory().then((r) => setSessions(r.data)).catch(() => setSessions([]));
  }, []);

  if (!sessions) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Skeleton variant="text" width={300} height={50} />
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {[1,2,3].map(i => <Grid item xs={12} sm={4} key={i}><Skeleton variant="rounded" height={160} /></Grid>)}
      </Grid>
    </Container>
  );

  const completed = sessions.filter((s) => s.completed);
  const avgScore = completed.length
    ? (completed.reduce((sum, s) => sum + (s.score || 0), 0) / completed.length).toFixed(1)
    : '—';

  const chartData = completed.slice(0, 10).reverse().map((s, i) => ({
    name: `#${i + 1}`,
    score: s.score || 0,
  }));

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
      {/* Hero banner */}
      <Box sx={{
        background: isDark ? '#1a1a1a' : 'linear-gradient(135deg, #fff8e1, #fff3d0)',
        py: 5, px: 3, mb: 4,
      }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={800} sx={{ color: isDark ? '#fff' : '#1a1a1a' }}>
            Welcome back, <Box component="span" sx={{ color: '#f5a623' }}>{name}</Box>
          </Typography>
          <Typography sx={{ mt: 0.5, color: isDark ? 'rgba(255,255,255,0.5)' : '#888' }}>Track your interview preparation progress</Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Grid container spacing={3} sx={{ mb: 4, mt: -8 }}>
          <Grid item xs={12} sm={4}>
            <StatCard icon={<QuizRoundedIcon sx={{ color: '#fff', fontSize: 26 }} />}
              value={sessions.length} label="Total Interviews"
              gradient="#f5a623" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard icon={<TrendingUpRoundedIcon sx={{ color: '#fff', fontSize: 26 }} />}
              value={avgScore} label="Average Score"
              gradient="#1a1a1a" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard icon={<CheckCircleRoundedIcon sx={{ color: '#fff', fontSize: 26 }} />}
              value={completed.length} label="Completed"
              gradient="#22c55e" />
          </Grid>
        </Grid>

        {chartData.length > 0 && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight={600} color="text.primary">Recent Scores</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f5a623" />
                    <stop offset="100%" stopColor="#ffd54f" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6'} />
                <XAxis dataKey="name" stroke={isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af'} tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} stroke={isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af'} tick={{ fontSize: 12 }} />
                <Tooltip cursor={false} contentStyle={{ background: isDark ? '#1a1a1a' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #eee', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: isDark ? '#f5f5f5' : undefined, padding: '8px 12px', fontSize: 13 }} />
                <Bar dataKey="score" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        )}

        <Box textAlign="center">
          <Button variant="contained" size="large" startIcon={<RocketLaunchRoundedIcon />}
            onClick={() => navigate('/start')} sx={{ px: 5, py: 1.5, fontSize: 16 }}>
            Start New Interview
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

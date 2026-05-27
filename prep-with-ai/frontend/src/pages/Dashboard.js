import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Button, Box, Skeleton } from '@mui/material';
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
    background: 'rgba(255,255,255,0.03)',
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
    <Typography variant="h3" fontWeight={800}>{value}</Typography>
    <Typography color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
  </Paper>
);

export default function Dashboard() {
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          Welcome back, <Box component="span" sx={{
            background: 'linear-gradient(135deg, #7c4dff, #00e5ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>{name}</Box>
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Track your interview preparation progress</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<QuizRoundedIcon sx={{ color: '#fff', fontSize: 26 }} />}
            value={sessions.length} label="Total Interviews"
            gradient="linear-gradient(135deg, #7c4dff, #448aff)" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<TrendingUpRoundedIcon sx={{ color: '#fff', fontSize: 26 }} />}
            value={avgScore} label="Average Score"
            gradient="linear-gradient(135deg, #00e5ff, #1de9b6)" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<CheckCircleRoundedIcon sx={{ color: '#fff', fontSize: 26 }} />}
            value={completed.length} label="Completed"
            gradient="linear-gradient(135deg, #69f0ae, #00e676)" />
        </Grid>
      </Grid>

      {chartData.length > 0 && (
        <Paper sx={{ p: 3, mb: 4, background: 'rgba(255,255,255,0.03)' }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>Recent Scores</Typography>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c4dff" />
                  <stop offset="100%" stopColor="#448aff" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
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
  );
}

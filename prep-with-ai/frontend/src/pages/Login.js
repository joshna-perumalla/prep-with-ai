import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Link, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function Login({ onAuth }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      onAuth(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(124,77,255,0.15) 0%, transparent 60%)',
    }}>
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AutoAwesomeIcon sx={{ fontSize: 48, color: '#7c4dff', mb: 1 }} />
          <Typography variant="h4" fontWeight={800} sx={{
            background: 'linear-gradient(135deg, #7c4dff, #00e5ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Prep With AI</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>AI-powered interview preparation</Typography>
        </Box>
        <Paper sx={{ p: 4, background: 'rgba(255,255,255,0.03)' }}>
          <Typography variant="h5" align="center" gutterBottom fontWeight={700}>Welcome back</Typography>
          {error && <Typography color="error" sx={{ mb: 2, textAlign: 'center', fontSize: 14 }}>{error}</Typography>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" type="email" margin="normal" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }} />
            <TextField fullWidth label="Password" type="password" margin="normal" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><LockRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }} />
            <Button fullWidth variant="contained" type="submit" sx={{ mt: 3, py: 1.5, fontSize: 16 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
          <Typography align="center" sx={{ mt: 3, color: 'text.secondary' }}>
            No account? <Link href="/register" underline="hover" sx={{ color: '#7c4dff', fontWeight: 600 }}>Create one</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

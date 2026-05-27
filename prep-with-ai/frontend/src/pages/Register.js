import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Link, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function Register({ onAuth }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', branch: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      onAuth(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', required: true, icon: <PersonRoundedIcon /> },
    { key: 'email', label: 'Email', type: 'email', required: true, icon: <EmailRoundedIcon /> },
    { key: 'password', label: 'Password', type: 'password', required: true, icon: <LockRoundedIcon />, inputProps: { minLength: 6 } },
    { key: 'college', label: 'College', type: 'text', required: false, icon: <SchoolRoundedIcon /> },
    { key: 'branch', label: 'Branch', type: 'text', required: false, icon: <AccountTreeRoundedIcon /> },
  ];

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(124,77,255,0.15) 0%, transparent 60%)',
    }}>
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <AutoAwesomeIcon sx={{ fontSize: 48, color: '#7c4dff', mb: 1 }} />
          <Typography variant="h4" fontWeight={800} sx={{
            background: 'linear-gradient(135deg, #7c4dff, #00e5ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Get Started</Typography>
        </Box>
        <Paper sx={{ p: 4, background: 'rgba(255,255,255,0.03)' }}>
          {error && <Typography color="error" sx={{ mb: 2, textAlign: 'center', fontSize: 14 }}>{error}</Typography>}
          <Box component="form" onSubmit={handleSubmit}>
            {fields.map((f) => (
              <TextField key={f.key} fullWidth label={f.label} type={f.type} margin="normal"
                required={f.required} value={form[f.key]} onChange={set(f.key)}
                inputProps={f.inputProps}
                InputProps={{ startAdornment: <InputAdornment position="start">{React.cloneElement(f.icon, { sx: { color: 'text.secondary', fontSize: 20 } })}</InputAdornment> }} />
            ))}
            <Button fullWidth variant="contained" type="submit" sx={{ mt: 3, py: 1.5, fontSize: 16 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </Box>
          <Typography align="center" sx={{ mt: 3, color: 'text.secondary' }}>
            Already registered? <Link href="/login" underline="hover" sx={{ color: '#7c4dff', fontWeight: 600 }}>Sign In</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

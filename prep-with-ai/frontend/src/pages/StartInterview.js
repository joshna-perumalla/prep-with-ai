import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, MenuItem, Box, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { interviewApi } from '../services/api';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

const DOMAINS = ['Backend Development', 'Frontend Development', 'Full Stack', 'Data Structures', 'System Design', 'Database', 'DevOps'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DIFF_COLORS = { Easy: '#69f0ae', Medium: '#ffd740', Hard: '#ff5252' };

export default function StartInterview() {
  const [form, setForm] = useState({ domain: '', techStack: '', difficulty: 'Medium' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await interviewApi.start(form);
      navigate(`/interview/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <Box sx={{
      minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 30% 20%, rgba(124,77,255,0.08) 0%, transparent 50%)',
    }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 5, background: 'rgba(255,255,255,0.03)' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight={800}>Configure Interview</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>Choose your domain and difficulty to begin</Typography>
          </Box>
          {error && <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{error}</Typography>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField select fullWidth label="Domain" margin="normal" required value={form.domain} onChange={set('domain')}
              InputProps={{ startAdornment: <InputAdornment position="start"><CategoryRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}>
              {DOMAINS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Tech Stack" margin="normal" required placeholder="e.g. Spring Boot, React, PostgreSQL"
              value={form.techStack} onChange={set('techStack')}
              InputProps={{ startAdornment: <InputAdornment position="start"><LayersRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }} />
            <TextField select fullWidth label="Difficulty" margin="normal" required value={form.difficulty} onChange={set('difficulty')}
              InputProps={{ startAdornment: <InputAdornment position="start"><SpeedRoundedIcon sx={{ color: DIFF_COLORS[form.difficulty] || 'text.secondary', fontSize: 20 }} /></InputAdornment> }}>
              {DIFFICULTIES.map((d) => <MenuItem key={d} value={d}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: DIFF_COLORS[d] }} />
                  {d}
                </Box>
              </MenuItem>)}
            </TextField>
            <Button fullWidth variant="contained" type="submit" sx={{ mt: 4, py: 1.5, fontSize: 16 }}
              disabled={loading} startIcon={!loading && <PlayArrowRoundedIcon />} size="large">
              {loading ? 'Generating Questions...' : 'Start Interview'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

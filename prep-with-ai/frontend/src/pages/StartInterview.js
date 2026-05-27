import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, MenuItem, Box, InputAdornment } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { interviewApi } from '../services/api';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

const DOMAINS = ['Backend Development', 'Frontend Development', 'Full Stack', 'Data Structures', 'System Design', 'Database', 'DevOps'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DIFF_COLORS = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };
const NO_TECH_STACK_DOMAINS = ['System Design', 'Data Structures'];
const TECH_STACK_HINTS = {
  'Backend Development': 'e.g. Spring Boot, Node.js, Django',
  'Frontend Development': 'e.g. React, Angular, Vue.js',
  'Full Stack': 'e.g. React + Spring Boot, MERN',
  'Database': 'e.g. PostgreSQL, MongoDB, MySQL',
  'DevOps': 'e.g. Docker, Kubernetes, AWS',
};

export default function StartInterview() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
      bgcolor: 'background.default',
    }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 5 }}>
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
            {!NO_TECH_STACK_DOMAINS.includes(form.domain) && (
              <TextField fullWidth label="Tech Stack (optional)" margin="normal"
                placeholder={TECH_STACK_HINTS[form.domain] || 'e.g. Spring Boot, React, PostgreSQL'}
                value={form.techStack} onChange={set('techStack')}
                InputProps={{ startAdornment: <InputAdornment position="start"><LayersRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }} />
            )}
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

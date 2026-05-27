import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, MenuItem, Box, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { codingApi } from '../services/api';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';

const TOPICS = [
  'Arrays', 'Strings', 'Linked Lists', 'Stacks & Queues', 'Trees',
  'Graphs', 'Dynamic Programming', 'Sorting & Searching', 'Recursion',
  'Hashing', 'Greedy', 'Math & Number Theory',
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DIFF_COLORS = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' };

export default function StartCoding() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [form, setForm] = useState({ difficulty: 'Medium', topic: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await codingApi.generate(form);
      navigate(`/coding/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate problem. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CodeRoundedIcon sx={{ fontSize: 48, color: '#f5a623', mb: 1 }} />
          <Typography variant="h4" fontWeight={800} color="text.primary">DSA Coding Challenge</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Solve AI-generated coding problems with a real code editor</Typography>
        </Box>

        <Paper sx={{ p: 4 }} component="form" onSubmit={handleStart}>
          <TextField select fullWidth label="Topic" margin="normal"
            value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
            <MenuItem value="">Any Topic</MenuItem>
            {TOPICS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1.5 }}>Difficulty</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {DIFFICULTIES.map((d) => (
              <Chip key={d} label={d} clickable size="medium"
                onClick={() => setForm({ ...form, difficulty: d })}
                sx={{
                  fontWeight: 700,
                  bgcolor: form.difficulty === d ? `${DIFF_COLORS[d]}18` : 'transparent',
                  color: form.difficulty === d ? DIFF_COLORS[d] : 'text.secondary',
                  border: `1.5px solid ${form.difficulty === d ? DIFF_COLORS[d] : 'transparent'}`,
                  '&:hover': { bgcolor: `${DIFF_COLORS[d]}18`, color: DIFF_COLORS[d] },
                }} />
            ))}
          </Box>

          {error && <Typography color="error" sx={{ mb: 2, fontSize: 14 }}>{error}</Typography>}

          <Button fullWidth variant="contained" type="submit" disabled={loading}
            endIcon={<RocketLaunchRoundedIcon />} sx={{ py: 1.5, fontSize: 16 }}>
            {loading ? 'Generating Problem...' : 'Start Coding'}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

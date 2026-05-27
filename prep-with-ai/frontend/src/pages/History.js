import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button, Box, Skeleton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { interviewApi } from '../services/api';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';

const DIFF_COLORS = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };

export default function History() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [sessions, setSessions] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    interviewApi.getHistory().then((r) => setSessions(r.data)).catch(() => setSessions([]));
  }, []);

  if (!sessions) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Skeleton variant="text" width={250} height={45} />
      {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={56} sx={{ mt: 1 }} />)}
    </Container>
  );

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default', py: 4 }}>
    <Container maxWidth="lg" sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <HistoryRoundedIcon sx={{ color: '#f5a623', fontSize: 32 }} />
        <Typography variant="h4" fontWeight={800} color="text.primary">Interview History</Typography>
      </Box>

      {sessions.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>No interviews yet</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Start your first interview to see your history here.</Typography>
          <Button variant="contained" startIcon={<RocketLaunchRoundedIcon />} onClick={() => navigate('/start')}>
            Start Your First Interview
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 } }}>
                <TableCell>Date</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Tech Stack</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s.id} hover sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: isDark ? 'rgba(245,166,35,0.06)' : '#fffbf0' },
                }} onClick={() => navigate(`/interview/${s.id}`)}>
                  <TableCell sx={{ color: 'text.secondary' }}>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{s.domain}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{s.techStack}</TableCell>
                  <TableCell>
                    <Chip label={s.difficulty} size="small" variant="outlined"
                      sx={{ borderColor: DIFF_COLORS[s.difficulty], color: DIFF_COLORS[s.difficulty], fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={700} sx={{ color: s.score >= 7 ? '#10b981' : s.score >= 5 ? '#f59e0b' : s.score != null ? '#ef4444' : 'text.secondary' }}>
                      {s.score != null ? `${s.score}/10` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={s.completed ? 'Completed' : 'In Progress'} size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: s.completed ? (isDark ? 'rgba(16,185,129,0.15)' : '#d1fae5') : (isDark ? 'rgba(245,158,11,0.15)' : '#fef3c7'),
                        color: s.completed ? '#059669' : '#d97706',
                      }} />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<VisibilityRoundedIcon sx={{ fontSize: 16 }} />}
                      sx={{ color: '#f5a623' }}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
    </Box>
  );
}

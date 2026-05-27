import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button, Box, Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { interviewApi } from '../services/api';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';

const DIFF_COLORS = { Easy: '#69f0ae', Medium: '#ffd740', Hard: '#ff5252' };

export default function History() {
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <HistoryRoundedIcon sx={{ color: '#7c4dff', fontSize: 32 }} />
        <Typography variant="h4" fontWeight={800}>Interview History</Typography>
      </Box>

      {sessions.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>No interviews yet</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Start your first interview to see your history here.</Typography>
          <Button variant="contained" startIcon={<RocketLaunchRoundedIcon />} onClick={() => navigate('/start')}>
            Start Your First Interview
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ background: 'rgba(255,255,255,0.03)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 } }}>
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
                  '& td': { borderColor: 'rgba(255,255,255,0.04)' },
                  '&:hover': { bgcolor: 'rgba(124,77,255,0.05)' },
                }} onClick={() => navigate(`/interview/${s.id}`)}>
                  <TableCell sx={{ color: 'text.secondary' }}>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{s.domain}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{s.techStack}</TableCell>
                  <TableCell>
                    <Chip label={s.difficulty} size="small" variant="outlined"
                      sx={{ borderColor: DIFF_COLORS[s.difficulty], color: DIFF_COLORS[s.difficulty], fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={700} sx={{ color: s.score >= 7 ? '#69f0ae' : s.score >= 5 ? '#ffd740' : s.score != null ? '#ff5252' : 'text.secondary' }}>
                      {s.score != null ? `${s.score}/10` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={s.completed ? 'Completed' : 'In Progress'} size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: s.completed ? 'rgba(105,240,174,0.12)' : 'rgba(255,215,64,0.12)',
                        color: s.completed ? '#69f0ae' : '#ffd740',
                      }} />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<VisibilityRoundedIcon sx={{ fontSize: 16 }} />}
                      sx={{ color: '#7c4dff' }}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

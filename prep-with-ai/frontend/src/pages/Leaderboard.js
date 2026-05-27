import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Box, TextField, MenuItem,
  Chip, Skeleton, Avatar, InputAdornment
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { leaderboardApi } from '../services/api';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';

const MEDAL_COLORS = ['#ffd740', '#b0bec5', '#a1887f'];
const MEDAL_LABELS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState(null);
  const [domain, setDomain] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [college, setCollege] = useState('');

  useEffect(() => {
    leaderboardApi.getFilters().then((r) => setFilters(r.data)).catch(() => setFilters({ domains: [], difficulties: [], colleges: [] }));
  }, []);

  useEffect(() => {
    const params = {};
    if (domain) params.domain = domain;
    if (difficulty) params.difficulty = difficulty;
    if (college) params.college = college;
    leaderboardApi.get(params).then((r) => setData(r.data)).catch(() => setData({ entries: [], totalParticipants: 0 }));
  }, [domain, difficulty, college]);

  if (!data || !filters) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Skeleton variant="text" width={300} height={50} />
      {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rounded" height={56} sx={{ mt: 1 }} />)}
    </Container>
  );

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default', py: 4 }}>
    <Container maxWidth="lg" sx={{ mb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <LeaderboardRoundedIcon sx={{ color: '#f5a623', fontSize: 32 }} />
        <Typography variant="h4" fontWeight={800} color="text.primary">Leaderboard</Typography>
      </Box>
      <Typography color="text.secondary" sx={{ mb: 3 }}>See how you rank against other candidates</Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FilterAltRoundedIcon sx={{ color: 'text.secondary' }} />
        <TextField select size="small" label="Domain" value={domain} onChange={(e) => setDomain(e.target.value)}
          sx={{ minWidth: 180 }}
          InputProps={{ startAdornment: domain ? undefined : <InputAdornment position="start" /> }}>
          <MenuItem value="">All Domains</MenuItem>
          {filters.domains?.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
          sx={{ minWidth: 150 }}>
          <MenuItem value="">All Levels</MenuItem>
          {filters.difficulties?.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="College" value={college} onChange={(e) => setCollege(e.target.value)}
          sx={{ minWidth: 180 }}>
          <MenuItem value="">All Colleges</MenuItem>
          {filters.colleges?.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <Box sx={{ flexGrow: 1 }} />
        <Chip icon={<PeopleRoundedIcon />} label={`${data.totalParticipants} participants`}
          sx={{ bgcolor: isDark ? 'rgba(245,166,35,0.12)' : '#fff8e1', color: '#f5a623', fontWeight: 700 }} />
      </Paper>

      {/* Top 3 Podium */}
      {data.entries.length >= 3 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          {[1, 0, 2].map((idx) => {
            const entry = data.entries[idx];
            const isFirst = idx === 0;
            return (
              <Paper key={idx} sx={{
                p: 3, textAlign: 'center', minWidth: 180, flex: '0 1 200px',
                transform: isFirst ? 'scale(1.08)' : 'none',
                border: isFirst ? '2px solid #fbbf24' : undefined,
                position: 'relative', overflow: 'hidden',
              }}>
                {isFirst && <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #ffd740, #ffab00)' }} />}
                <Typography sx={{ fontSize: 36, mb: 1 }}>{MEDAL_LABELS[idx]}</Typography>
                <Avatar sx={{
                  width: isFirst ? 56 : 48, height: isFirst ? 56 : 48, mx: 'auto', mb: 1,
                  fontSize: isFirst ? 22 : 18, fontWeight: 800,
                  background: `linear-gradient(135deg, ${MEDAL_COLORS[idx]}, ${MEDAL_COLORS[idx]}88)`,
                  color: '#1e1b4b',
                }}>
                  {entry.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </Avatar>
                <Typography fontWeight={700} color="text.primary" sx={{ fontSize: isFirst ? 18 : 16 }}>{entry.name}</Typography>
                {entry.college && <Typography variant="caption" color="text.secondary">{entry.college}</Typography>}
                <Typography variant="h5" fontWeight={800} sx={{ mt: 1, color: '#f5a623' }}>{entry.avgScore}/10</Typography>
                <Typography variant="caption" color="text.secondary">{entry.totalCompleted} interviews</Typography>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Full Table */}
      {data.entries.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <EmojiEventsRoundedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">No results yet</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Complete interviews to appear on the leaderboard</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 } }}>
                <TableCell width={60}>Rank</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>College</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell align="center">Avg Score</TableCell>
                <TableCell align="center">Interviews</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.entries.map((entry) => (
                <TableRow key={entry.rank} sx={{
                  '&:hover': { bgcolor: isDark ? 'rgba(245,166,35,0.06)' : '#fffbf0' },
                  ...(entry.rank <= 3 ? { bgcolor: isDark ? 'rgba(255,215,64,0.06)' : '#fffbeb' } : {}),
                }}>
                  <TableCell>
                    {entry.rank <= 3 ? (
                      <Typography sx={{ fontSize: 22 }}>{MEDAL_LABELS[entry.rank - 1]}</Typography>
                    ) : (
                      <Typography fontWeight={700} color="text.secondary">#{entry.rank}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{
                        width: 32, height: 32, fontSize: 13, fontWeight: 700,
                        background: entry.rank <= 3 ? `linear-gradient(135deg, ${MEDAL_COLORS[entry.rank - 1]}, ${MEDAL_COLORS[entry.rank - 1]}88)` : '#f5a623',
                        color: entry.rank <= 3 ? '#1e1b4b' : '#fff',
                      }}>
                        {entry.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </Avatar>
                      <Typography fontWeight={600}>{entry.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{entry.college || '—'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{entry.branch || '—'}</TableCell>
                  <TableCell align="center">
                    <Typography fontWeight={700} sx={{
                      color: entry.avgScore >= 7 ? '#10b981' : entry.avgScore >= 5 ? '#f59e0b' : '#ef4444'
                    }}>{entry.avgScore}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={entry.totalCompleted} size="small"
                      sx={{ fontWeight: 700, bgcolor: isDark ? 'rgba(245,166,35,0.12)' : '#fff8e1', color: '#f5a623', minWidth: 36 }} />
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

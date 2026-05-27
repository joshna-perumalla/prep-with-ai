import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';

export default function Navbar({ onLogout, mode, toggleMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = mode === 'dark';
  const name = localStorage.getItem('userName') || 'User';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <DashboardRoundedIcon sx={{ fontSize: 18 }} /> },
    { label: 'New Interview', path: '/start', icon: <AddCircleRoundedIcon sx={{ fontSize: 18 }} /> },
    { label: 'History', path: '/history', icon: <HistoryRoundedIcon sx={{ fontSize: 18 }} /> },
    { label: 'Leaderboard', path: '/leaderboard', icon: <LeaderboardRoundedIcon sx={{ fontSize: 18 }} /> },
    { label: 'DSA', path: '/coding', icon: <CodeRoundedIcon sx={{ fontSize: 18 }} /> },
  ];

  return (
    <AppBar position="sticky" elevation={0} sx={{
      background: isDark ? '#0f0f0f' : '#fff',
      borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #f0ede8',
    }}>
      <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
        <AutoAwesomeIcon sx={{ mr: 1.5, color: '#f5a623', fontSize: 28 }} />
        <Typography variant="h6" sx={{
          cursor: 'pointer',
          fontWeight: 800,
          color: isDark ? '#fff' : '#1a1a1a',
          letterSpacing: '-0.02em',
        }} onClick={() => navigate('/')}>
          Prep With AI
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', gap: 0.5, mr: 2 }}>
          {navItems.map((item) => (
            <Button key={item.path} color="inherit" startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 3,
                px: 2,
                textTransform: 'none',
                letterSpacing: 0,
                color: location.pathname === item.path ? '#f5a623' : (isDark ? 'rgba(255,255,255,0.5)' : '#888'),
                bgcolor: location.pathname === item.path ? (isDark ? 'rgba(245,166,35,0.1)' : '#fff8e1') : 'transparent',
                fontWeight: location.pathname === item.path ? 700 : 500,
                '&:hover': { bgcolor: isDark ? 'rgba(245,166,35,0.08)' : '#fff8e1', color: '#f5a623' },
              }}>
              {item.label}
            </Button>
          ))}
        </Box>
        <IconButton onClick={toggleMode} size="small" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#888', mr: 1, '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#f5f5f5' } }}>
          {mode === 'dark' ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
        </IconButton>
        <Avatar sx={{
          width: 34, height: 34, fontSize: 14, fontWeight: 700,
          background: '#f5a623',
          color: '#fff',
          mr: 1,
        }}>{initials}</Avatar>
        <IconButton onClick={onLogout} size="small" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#888' }}>
          <LogoutRoundedIcon fontSize="small" />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

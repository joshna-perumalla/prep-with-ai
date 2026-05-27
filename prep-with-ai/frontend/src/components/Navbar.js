import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const name = localStorage.getItem('userName') || 'User';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <DashboardRoundedIcon sx={{ fontSize: 18 }} /> },
    { label: 'New Interview', path: '/start', icon: <AddCircleRoundedIcon sx={{ fontSize: 18 }} /> },
    { label: 'History', path: '/history', icon: <HistoryRoundedIcon sx={{ fontSize: 18 }} /> },
  ];

  return (
    <AppBar position="sticky" elevation={0} sx={{
      background: 'rgba(11,14,23,0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
        <AutoAwesomeIcon sx={{ mr: 1.5, color: '#7c4dff', fontSize: 28 }} />
        <Typography variant="h6" sx={{
          cursor: 'pointer',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #7c4dff, #00e5ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
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
                color: location.pathname === item.path ? '#7c4dff' : 'text.secondary',
                bgcolor: location.pathname === item.path ? 'rgba(124,77,255,0.1)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(124,77,255,0.08)' },
              }}>
              {item.label}
            </Button>
          ))}
        </Box>
        <Avatar sx={{
          width: 34, height: 34, fontSize: 14, fontWeight: 700,
          background: 'linear-gradient(135deg, #7c4dff, #448aff)',
          mr: 1,
        }}>{initials}</Avatar>
        <IconButton onClick={onLogout} size="small" sx={{ color: 'text.secondary' }}>
          <LogoutRoundedIcon fontSize="small" />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

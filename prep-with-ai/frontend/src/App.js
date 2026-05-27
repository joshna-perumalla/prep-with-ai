import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StartInterview from './pages/StartInterview';
import InterviewSession from './pages/InterviewSession';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';
import StartCoding from './pages/StartCoding';
import CodingSession from './pages/CodingSession';
import Navbar from './components/Navbar';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');

  const toggleMode = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    localStorage.setItem('themeMode', next);
  };

  const isDark = mode === 'dark';

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#f5a623', light: '#ffd54f', dark: '#c17900' },
      secondary: { main: '#1a1a1a', light: '#444', dark: '#000' },
      success: { main: '#22c55e' },
      warning: { main: '#f59e0b' },
      error: { main: '#ef4444' },
      background: {
        default: isDark ? '#0f0f0f' : '#faf9f6',
        paper: isDark ? '#1a1a1a' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f5f5f5' : '#1a1a1a',
        secondary: isDark ? 'rgba(255,255,255,0.5)' : '#888',
      },
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
      h3: { fontWeight: 900, letterSpacing: '-0.03em' },
      h4: { fontWeight: 800, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isDark
              ? '0 2px 8px rgba(0,0,0,0.4)'
              : '0 1px 4px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.03)',
            border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.04)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          contained: {
            background: '#f5a623',
            boxShadow: 'none',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: 50,
            padding: '10px 28px',
            color: '#fff',
            fontSize: '0.9rem',
            '&:hover': {
              background: '#e09500',
              boxShadow: '0 4px 16px rgba(245,166,35,0.3)',
            },
          },
          outlined: {
            textTransform: 'none', fontWeight: 600, borderRadius: 50,
            borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#ddd',
            color: isDark ? '#fff' : '#1a1a1a',
            '&:hover': { borderColor: '#f5a623', color: '#f5a623' },
          },
          text: { textTransform: 'none', fontWeight: 600 },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#faf9f6',
              '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e2dd' },
              '&:hover fieldset': { borderColor: '#f5a623' },
              '&.Mui-focused fieldset': { borderColor: '#f5a623' },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 8 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f0ede8' },
        },
      },
    },
  }), [mode, isDark]);

  const handleAuth = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userName', data.name);
    setToken(data.token);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
  };

  const ProtectedRoute = ({ children }) =>
    token ? children : <Navigate to="/login" />;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {token && <Navbar onLogout={handleLogout} mode={mode} toggleMode={toggleMode} />}
        <Routes>
          <Route path="/login" element={<Login onAuth={handleAuth} />} />
          <Route path="/register" element={<Register onAuth={handleAuth} />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/start" element={<ProtectedRoute><StartInterview /></ProtectedRoute>} />
          <Route path="/interview/:sessionId" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/coding" element={<ProtectedRoute><StartCoding /></ProtectedRoute>} />
          <Route path="/coding/:problemId" element={<ProtectedRoute><CodingSession /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

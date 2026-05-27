import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StartInterview from './pages/StartInterview';
import InterviewSession from './pages/InterviewSession';
import History from './pages/History';
import Navbar from './components/Navbar';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const theme = useMemo(() => createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#7c4dff', light: '#b47cff', dark: '#3f1dcb' },
      secondary: { main: '#00e5ff', light: '#6effff', dark: '#00b2cc' },
      success: { main: '#69f0ae' },
      warning: { main: '#ffd740' },
      error: { main: '#ff5252' },
      background: { default: '#0b0e17', paper: 'rgba(255,255,255,0.05)' },
      text: { primary: '#e8eaed', secondary: 'rgba(255,255,255,0.55)' },
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
      h3: { fontWeight: 800, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700, letterSpacing: '-0.01em' },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          contained: {
            background: 'linear-gradient(135deg, #7c4dff 0%, #448aff 100%)',
            boxShadow: '0 4px 20px rgba(124,77,255,0.3)',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #651fff 0%, #2979ff 100%)',
              boxShadow: '0 6px 28px rgba(124,77,255,0.45)',
            },
          },
          outlined: { textTransform: 'none', fontWeight: 600 },
          text: { textTransform: 'none', fontWeight: 600 },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
              '&:hover fieldset': { borderColor: 'rgba(124,77,255,0.5)' },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
        },
      },
    },
  }), []);

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
        {token && <Navbar onLogout={handleLogout} />}
        <Routes>
          <Route path="/login" element={<Login onAuth={handleAuth} />} />
          <Route path="/register" element={<Register onAuth={handleAuth} />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/start" element={<ProtectedRoute><StartInterview /></ProtectedRoute>} />
          <Route path="/interview/:sessionId" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

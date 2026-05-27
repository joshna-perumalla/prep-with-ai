import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Chip, LinearProgress, Alert, Divider, IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewApi } from '../services/api';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';

const ScoreChip = ({ score }) => {
  const color = score >= 7 ? 'success' : score >= 5 ? 'warning' : 'error';
  return <Chip label={`${score}/10`} size="small" color={color} sx={{ fontWeight: 700 }} />;
};

export default function InterviewSession() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechSupported = !!SpeechRecognition;

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!speechSupported) return;
    stopListening();
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    let finalTranscript = '';
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      setAnswer(prev => {
        const base = finalTranscript || '';
        return (base + interim).trim();
      });
    };
    recognition.onerror = () => stopListening();
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [speechSupported, stopListening]);

  useEffect(() => {
    return () => { if (recognitionRef.current) recognitionRef.current.stop(); };
  }, []);

  useEffect(() => {
    interviewApi.getSession(sessionId).then((r) => {
      setSession(r.data);
      const firstUnanswered = r.data.questions.findIndex((q) => !q.userAnswer);
      setCurrentIdx(firstUnanswered >= 0 ? firstUnanswered : r.data.questions.length - 1);
    });
  }, [sessionId]);

  if (!session) return (
    <Container sx={{ mt: 8, textAlign: 'center' }}>
      <LinearProgress sx={{ borderRadius: 2, height: 4, maxWidth: 400, mx: 'auto' }} />
      <Typography color="text.secondary" sx={{ mt: 2 }}>Loading interview...</Typography>
    </Container>
  );

  const questions = session.questions;
  const current = questions[currentIdx];
  const isCompleted = session.completed || questions.every((q) => q.userAnswer);
  const progress = (questions.filter((q) => q.userAnswer).length / questions.length) * 100;

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const { data } = await interviewApi.submitAnswer(current.id, answer);
      setFeedback(data);
      const updated = { ...session };
      updated.questions[currentIdx] = { ...current, ...data };
      if (currentIdx === questions.length - 1) {
        const refreshed = await interviewApi.getSession(sessionId);
        setSession(refreshed.data);
      } else {
        setSession(updated);
      }
    } catch (err) {
      setFeedback({ aiFeedback: 'Error submitting answer. Please try again.', score: null });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setAnswer('');
    setFeedback(null);
    setCurrentIdx((i) => Math.min(i + 1, questions.length - 1));
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default', py: 4 }}>
    <Container maxWidth="md" sx={{ mb: 6 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="text.primary">{session.domain}</Typography>
          <Typography color="text.secondary">{session.techStack}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip label={session.difficulty} variant="outlined"
            sx={{ borderColor: session.difficulty === 'Hard' ? '#ef4444' : session.difficulty === 'Medium' ? '#f59e0b' : '#10b981',
                  color: session.difficulty === 'Hard' ? '#ef4444' : session.difficulty === 'Medium' ? '#f59e0b' : '#10b981', fontWeight: 700 }} />
          <Chip label={`${questions.filter(q => q.userAnswer).length}/${questions.length}`} sx={{ fontWeight: 700, bgcolor: isDark ? 'rgba(245,166,35,0.12)' : '#fff8e1', color: '#f5a623' }} />
        </Box>
      </Paper>

      <LinearProgress variant="determinate" value={progress} sx={{
        mb: 3, borderRadius: 2, height: 6,
        bgcolor: '#e5e7eb',
        '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #f5a623, #ffd54f)', borderRadius: 2 },
      }} />

      {/* Completed View */}
      {isCompleted && session.score != null ? (
        <Box>
          <Paper sx={{ p: 5, textAlign: 'center', mb: 4, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #f5a623, #ffd54f)' }} />
            <EmojiEventsRoundedIcon sx={{ fontSize: 64, color: '#f59e0b', mb: 1 }} />
            <Typography variant="h4" fontWeight={800} color="text.primary">Interview Complete!</Typography>
            <Typography variant="h2" sx={{ my: 2, fontWeight: 800, color: '#f5a623' }}>
              {session.score}/10
            </Typography>
            <Typography color="text.secondary">Overall Score</Typography>
          </Paper>

          {questions.map((q, i) => (
            <Paper key={q.id} sx={{ p: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography fontWeight={700} sx={{ color: '#f5a623' }}>Question {i + 1}</Typography>
                <ScoreChip score={q.score} />
              </Box>
              <Typography color="text.primary" sx={{ mb: 2 }}>{q.question}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>Your answer:</strong> {q.userAnswer}</Typography>
              <Typography variant="body2" sx={{ color: '#059669' }}><strong>Feedback:</strong> {q.aiFeedback}</Typography>
            </Paper>
          ))}
          <Box textAlign="center" sx={{ mt: 3 }}>
            <Button variant="contained" startIcon={<HomeRoundedIcon />} onClick={() => navigate('/')} sx={{ px: 4 }}>
              Back to Dashboard
            </Button>
          </Box>
        </Box>
      ) : (
        /* Active Question View */
        <Paper sx={{ p: 4 }}>
          <Typography variant="overline" sx={{ color: '#f5a623', fontWeight: 700, letterSpacing: 2 }}>
            Question {currentIdx + 1} of {questions.length}
          </Typography>
          <Typography variant="h6" sx={{ mt: 1.5, mb: 1, lineHeight: 1.6 }} color="text.primary">{current.question}</Typography>

          {current.userAnswer ? (
            <>
              <Alert severity="info" variant="outlined" sx={{ mb: 2, borderRadius: 3 }}>You already answered this question.</Alert>
              <Typography variant="body2" color="text.secondary"><strong>Your answer:</strong> {current.userAnswer}</Typography>
              <Typography variant="body2" sx={{ mt: 1, color: '#059669' }}><strong>Feedback:</strong> {current.aiFeedback}</Typography>
              <Box sx={{ mt: 1 }}><ScoreChip score={current.score} /></Box>
              {currentIdx < questions.length - 1 && (
                <Box sx={{ mt: 3 }}><Button variant="contained" endIcon={<ArrowForwardRoundedIcon />} onClick={handleNext}>Next Question</Button></Box>
              )}
            </>
          ) : (
            <>
              <TextField fullWidth multiline rows={5} placeholder={listening ? '🎙️ Listening... speak your answer' : 'Type your answer or use the mic button...'}
                value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={submitting}
                sx={listening ? { '& .MuiOutlinedInput-root': { borderColor: '#ef4444', boxShadow: '0 0 0 2px rgba(239,68,68,0.2)' } } : {}} />
              {speechSupported && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                  <Tooltip title={listening ? 'Stop recording' : 'Start voice input'}>
                    <IconButton
                      onClick={listening ? stopListening : startListening}
                      disabled={submitting}
                      sx={{
                        width: 44, height: 44,
                        bgcolor: listening ? '#ef4444' : (isDark ? 'rgba(245,166,35,0.12)' : '#fff8e1'),
                        color: listening ? '#fff' : '#f5a623',
                        animation: listening ? 'pulse 1.5s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.4)' },
                          '70%': { boxShadow: '0 0 0 10px rgba(239,68,68,0)' },
                          '100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0)' },
                        },
                        '&:hover': { bgcolor: listening ? '#dc2626' : (isDark ? 'rgba(245,166,35,0.2)' : '#ffecb3') },
                      }}>
                      {listening ? <MicOffRoundedIcon /> : <MicRoundedIcon />}
                    </IconButton>
                  </Tooltip>
                  {listening && (
                    <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                      Recording...
                    </Typography>
                  )}
                </Box>
              )}
              {feedback && (
                <Paper variant="outlined" sx={{ p: 3, mt: 2, borderColor: isDark ? 'rgba(16,185,129,0.3)' : '#d1fae5', background: isDark ? 'rgba(16,185,129,0.08)' : '#f0fdf4' }}>
                  <Typography variant="body2" color="text.primary"><strong>Feedback:</strong> {feedback.aiFeedback}</Typography>
                  {feedback.score != null && <Box sx={{ mt: 1 }}><ScoreChip score={feedback.score} /></Box>}
                </Paper>
              )}
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                {!feedback ? (
                  <Button variant="contained" onClick={handleSubmit} disabled={submitting || !answer.trim()}
                    endIcon={<SendRoundedIcon />} sx={{ px: 4 }}>
                    {submitting ? 'Evaluating...' : 'Submit Answer'}
                  </Button>
                ) : currentIdx < questions.length - 1 ? (
                  <Button variant="contained" endIcon={<ArrowForwardRoundedIcon />} onClick={handleNext}>Next Question</Button>
                ) : (
                  <Button variant="contained" onClick={() => { window.location.reload(); }}>
                    View Results
                  </Button>
                )}
              </Box>
            </>
          )}
        </Paper>
      )}
    </Container>
    </Box>
  );
}

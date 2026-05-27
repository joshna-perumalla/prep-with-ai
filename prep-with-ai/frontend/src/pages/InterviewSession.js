import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Chip, LinearProgress, Alert, Divider } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewApi } from '../services/api';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

const ScoreChip = ({ score }) => {
  const color = score >= 7 ? 'success' : score >= 5 ? 'warning' : 'error';
  return <Chip label={`${score}/10`} size="small" color={color} sx={{ fontWeight: 700 }} />;
};

export default function InterviewSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

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
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>{session.domain}</Typography>
          <Typography color="text.secondary">{session.techStack}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip label={session.difficulty} variant="outlined"
            sx={{ borderColor: session.difficulty === 'Hard' ? '#ff5252' : session.difficulty === 'Medium' ? '#ffd740' : '#69f0ae',
                  color: session.difficulty === 'Hard' ? '#ff5252' : session.difficulty === 'Medium' ? '#ffd740' : '#69f0ae', fontWeight: 700 }} />
          <Chip label={`${questions.filter(q => q.userAnswer).length}/${questions.length}`} sx={{ fontWeight: 700, bgcolor: 'rgba(124,77,255,0.15)', color: '#b47cff' }} />
        </Box>
      </Paper>

      <LinearProgress variant="determinate" value={progress} sx={{
        mb: 3, borderRadius: 2, height: 6,
        bgcolor: 'rgba(255,255,255,0.05)',
        '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #7c4dff, #00e5ff)', borderRadius: 2 },
      }} />

      {/* Completed View */}
      {isCompleted && session.score != null ? (
        <Box>
          <Paper sx={{ p: 5, textAlign: 'center', mb: 4, background: 'rgba(255,255,255,0.03)', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #7c4dff, #00e5ff)' }} />
            <EmojiEventsRoundedIcon sx={{ fontSize: 64, color: '#ffd740', mb: 1 }} />
            <Typography variant="h4" fontWeight={800}>Interview Complete!</Typography>
            <Typography variant="h2" sx={{ my: 2, fontWeight: 800, background: 'linear-gradient(135deg, #7c4dff, #00e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {session.score}/10
            </Typography>
            <Typography color="text.secondary">Overall Score</Typography>
          </Paper>

          {questions.map((q, i) => (
            <Paper key={q.id} sx={{ p: 3, mb: 2, background: 'rgba(255,255,255,0.03)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography fontWeight={700} sx={{ color: '#b47cff' }}>Question {i + 1}</Typography>
                <ScoreChip score={q.score} />
              </Box>
              <Typography sx={{ mb: 2 }}>{q.question}</Typography>
              <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>Your answer:</strong> {q.userAnswer}</Typography>
              <Typography variant="body2" sx={{ color: '#69f0ae' }}><strong>Feedback:</strong> {q.aiFeedback}</Typography>
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
        <Paper sx={{ p: 4, background: 'rgba(255,255,255,0.03)' }}>
          <Typography variant="overline" sx={{ color: '#7c4dff', fontWeight: 700, letterSpacing: 2 }}>
            Question {currentIdx + 1} of {questions.length}
          </Typography>
          <Typography variant="h6" sx={{ mt: 1.5, mb: 3, lineHeight: 1.6 }}>{current.question}</Typography>

          {current.userAnswer ? (
            <>
              <Alert severity="info" variant="outlined" sx={{ mb: 2, borderRadius: 3 }}>You already answered this question.</Alert>
              <Typography variant="body2" color="text.secondary"><strong>Your answer:</strong> {current.userAnswer}</Typography>
              <Typography variant="body2" sx={{ mt: 1, color: '#69f0ae' }}><strong>Feedback:</strong> {current.aiFeedback}</Typography>
              <Box sx={{ mt: 1 }}><ScoreChip score={current.score} /></Box>
              {currentIdx < questions.length - 1 && (
                <Box sx={{ mt: 3 }}><Button variant="contained" endIcon={<ArrowForwardRoundedIcon />} onClick={handleNext}>Next Question</Button></Box>
              )}
            </>
          ) : (
            <>
              <TextField fullWidth multiline rows={6} placeholder="Type your answer here..."
                value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={submitting}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.02)' } }} />
              {feedback && (
                <Paper variant="outlined" sx={{ p: 3, mt: 2, borderColor: 'rgba(105,240,174,0.3)', background: 'rgba(105,240,174,0.04)' }}>
                  <Typography variant="body2"><strong>Feedback:</strong> {feedback.aiFeedback}</Typography>
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
  );
}

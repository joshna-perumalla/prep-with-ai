import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, Button, Box, Chip, MenuItem, TextField, LinearProgress, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { codingApi } from '../services/api';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';

const LANGUAGES = [
  { value: 'python', label: 'Python', default: '# Read input and solve\nimport sys\ninput_data = sys.stdin.read().split()\n\n# Your solution here\n' },
  { value: 'java', label: 'Java', default: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your solution here\n    }\n}\n' },
  { value: 'javascript', label: 'JavaScript', default: '// Read input from stdin\nconst input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\\n");\n\n// Your solution here\n' },
  { value: 'cpp', label: 'C++', default: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Your solution here\n    return 0;\n}\n' },
  { value: 'c', label: 'C', default: '#include <stdio.h>\n\nint main() {\n    // Your solution here\n    return 0;\n}\n' },
  { value: 'go', label: 'Go', default: 'package main\n\nimport (\n    "fmt"\n)\n\nfunc main() {\n    // Your solution here\n    fmt.Println()\n}\n' },
];

export default function CodingSession() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(LANGUAGES[0].default);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    codingApi.getProblem(problemId).then((r) => {
      setProblem(r.data);
      if (r.data.userCode) {
        setCode(r.data.userCode);
        setLanguage(r.data.language || 'python');
      }
    });
  }, [problemId]);

  const handleLanguageChange = (newLang) => {
    const oldLangDef = LANGUAGES.find(l => l.value === language);
    const newLangDef = LANGUAGES.find(l => l.value === newLang);
    setLanguage(newLang);
    // Replace boilerplate if user hasn't written custom code
    if (newLangDef && (!code.trim() || code.trim() === oldLangDef?.default?.trim())) {
      setCode(newLangDef.default);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setResults(null);
    try {
      const { data } = await codingApi.submit(problemId, { code, language });
      setResults(data);
      if (data.allPassed) {
        setProblem(prev => ({ ...prev, solved: true, passedTests: data.passedTests, totalTests: data.totalTests }));
      }
    } catch (err) {
      setResults({ error: 'Failed to run code. Please try again.' });
    } finally {
      setRunning(false);
    }
  };

  if (!problem) return (
    <Container sx={{ mt: 8, textAlign: 'center' }}>
      <LinearProgress sx={{ borderRadius: 2, height: 4, maxWidth: 400, mx: 'auto' }} />
      <Typography color="text.secondary" sx={{ mt: 2 }}>Loading problem...</Typography>
    </Container>
  );

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: 'calc(100vh - 64px)' }}>
        {/* Left: Problem Description */}
        <Box sx={{ width: { xs: '100%', md: '40%' }, overflow: 'auto', borderRight: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eee', p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CodeRoundedIcon sx={{ color: '#f5a623' }} />
            <Typography variant="h5" fontWeight={800} color="text.primary">{problem.title}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label={problem.difficulty} size="small" sx={{
              fontWeight: 700,
              bgcolor: problem.difficulty === 'Hard' ? '#fef2f2' : problem.difficulty === 'Medium' ? '#fffbeb' : '#f0fdf4',
              color: problem.difficulty === 'Hard' ? '#ef4444' : problem.difficulty === 'Medium' ? '#f59e0b' : '#22c55e',
            }} />
            {problem.solved && <Chip icon={<CheckCircleRoundedIcon />} label="Solved" size="small" color="success" />}
          </Box>

          <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, mb: 3 }}>
            {problem.description}
          </Typography>

          {problem.constraints && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.primary" gutterBottom>Constraints</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{problem.constraints}</Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" fontWeight={700} color="text.primary" gutterBottom>Sample Input</Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2, fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#fafafa' }}>
            {problem.sampleInput}
          </Paper>

          <Typography variant="subtitle2" fontWeight={700} color="text.primary" gutterBottom>Sample Output</Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2, fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#fafafa' }}>
            {problem.sampleOutput}
          </Paper>
        </Box>

        {/* Right: Code Editor + Results */}
        <Box sx={{ width: { xs: '100%', md: '60%' }, display: 'flex', flexDirection: 'column' }}>
          {/* Toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eee' }}>
            <TextField select size="small" value={language} onChange={(e) => handleLanguageChange(e.target.value)}
              sx={{ minWidth: 140 }}>
              {LANGUAGES.map((l) => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
            </TextField>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="contained" onClick={handleRun} disabled={running || !code.trim()}
              startIcon={<PlayArrowRoundedIcon />}
              sx={{ borderRadius: 50 }}>
              {running ? 'Running...' : 'Run Code'}
            </Button>
          </Box>

          {/* Monaco Editor */}
          <Box sx={{ flexGrow: 1, minHeight: 300 }}>
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme={isDark ? 'vs-dark' : 'light'}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12 },
                fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
              }}
            />
          </Box>

          {/* Results Panel */}
          {(running || results) && (
            <Box sx={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eee', p: 2, maxHeight: 280, overflow: 'auto' }}>
              {running && <LinearProgress sx={{ borderRadius: 2, height: 4, mb: 1 }} />}
              {results && !results.error && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      {results.allPassed ? '🎉 All Tests Passed!' : `${results.passedTests}/${results.totalTests} Tests Passed`}
                    </Typography>
                    <Chip label={results.allPassed ? 'Accepted' : 'Wrong Answer'} size="small"
                      sx={{ fontWeight: 700, bgcolor: results.allPassed ? '#dcfce7' : '#fef2f2', color: results.allPassed ? '#16a34a' : '#ef4444' }} />
                  </Box>
                  {results.results.map((r) => (
                    <Paper key={r.testNumber} variant="outlined" sx={{
                      p: 2, mb: 1,
                      borderColor: r.passed ? (isDark ? 'rgba(34,197,94,0.3)' : '#bbf7d0') : (isDark ? 'rgba(239,68,68,0.3)' : '#fecaca'),
                      bgcolor: r.passed ? (isDark ? 'rgba(34,197,94,0.05)' : '#f0fdf4') : (isDark ? 'rgba(239,68,68,0.05)' : '#fef2f2'),
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        {r.passed ? <CheckCircleRoundedIcon sx={{ color: '#22c55e', fontSize: 18 }} /> : <CancelRoundedIcon sx={{ color: '#ef4444', fontSize: 18 }} />}
                        <Typography variant="body2" fontWeight={700} color="text.primary">Test Case {r.testNumber}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">Input</Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}>{r.input}</Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">Expected</Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}>{r.expectedOutput}</Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">Your Output</Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', color: r.passed ? '#22c55e' : '#ef4444' }}>{r.actualOutput}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </>
              )}
              {results?.error && (
                <Typography color="error" sx={{ fontFamily: 'monospace', fontSize: 13 }}>{results.error}</Typography>
              )}
            </Box>
          )}

          {/* Navigation */}
          {results?.allPassed && (
            <Box sx={{ p: 2, textAlign: 'center', borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eee' }}>
              <Button variant="contained" startIcon={<HomeRoundedIcon />} onClick={() => navigate('/')} sx={{ mr: 2 }}>
                Dashboard
              </Button>
              <Button variant="outlined" startIcon={<CodeRoundedIcon />} onClick={() => navigate('/coding')}>
                New Problem
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

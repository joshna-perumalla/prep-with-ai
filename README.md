
# Prep With AI — AI Mock Interview Platform

An AI-powered adaptive interview preparation platform. Users select a domain, tech stack, and difficulty level to receive AI-generated interview questions. Answer questions in a clean chat-style flow, get instant AI feedback with scores, and track your improvement over time.

## Tech Stack

| Layer    | Technology              |
|----------|------------------------|
| Frontend | React 18 + Material UI |
| Charts   | Recharts               |
| Backend  | Spring Boot 3.3        |
| Auth     | JWT                    |
| AI       | Groq API (LLaMA 3.1)  |
| Database | H2 (dev) / PostgreSQL  |

## MVP Features

1. **Authentication** — Register/Login with JWT
2. **Interview Generation** — Select domain, tech stack, difficulty → AI generates 5 questions
3. **Interview Session** — Answer questions one by one, get real-time AI feedback and per-question scores
4. **Dashboard** — Total interviews, average score, recent scores chart
5. **History** — View all past interview sessions with scores and details

## Getting Started

### Backend
```bash
cd backend
# Set your Groq API key
export GROQ_API_KEY=your_key_here
./mvnw spring-boot:run
```
Runs on http://localhost:8080. H2 console at http://localhost:8080/h2-console.

### Frontend
```bash
cd frontend
npm install
npm start
```
Runs on http://localhost:3000.

## Architecture

```
React Frontend (MUI) → Spring Boot REST APIs → Groq AI APIs
                                             → H2 / PostgreSQL
```

## Database Tables

- **users** — id, name, email, password, college, branch
- **interview_sessions** — id, user_id, domain, tech_stack, difficulty, score, completed, created_at
- **interview_questions** — id, session_id, question_order, question, user_answer, ai_feedback, score

## Future Enhancements

- Leaderboard (by college, branch, domain)
- User trends dashboard (weekly/monthly progress)
- Adaptive AI difficulty
- Voice interviews
- Coding rounds
- Recruiter mode

Backend sends prompt:

Generate 5 medium-level Java backend interview questions.

Groq returns:

structured questions

Backend stores them.

Simple and effective.

Suggested UI Flow
Dashboard

Show:

total interviews
average score
trend chart
leaderboard position
Interview Screen

Simple chat-like UI:

Question
↓
Textarea answer
↓
Submit
↓
Feedback
Leaderboard Page

Filters:

college
branch
domain
difficulty

This page will look GREAT in demos.

Tech Stack
Layer	Technology
Frontend	React
Styling	TailwindCSS
Backend	Spring Boot
Auth	JWT
AI	Groq API
DB	PostgreSQL
Charts	Recharts
What Makes This Resume-Worthy

Because this is NOT:

simple AI chatbot

It is:

AI-powered interview management platform

with:

workflows
analytics
persistence
ranking systems
personalized history

That’s MUCH stronger.

Future Enhancements (Mention in Resume)

You can mention planned scalability:

adaptive AI difficulty
voice interviews
real-time streaming
coding rounds
AI follow-up questioning
recruiter mode

Recruiters like seeing roadmap thinking.

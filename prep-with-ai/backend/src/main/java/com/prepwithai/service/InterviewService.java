package com.prepwithai.service;

import com.prepwithai.dto.InterviewDto.*;
import com.prepwithai.model.*;
import com.prepwithai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewSessionRepository sessionRepo;
    private final InterviewQuestionRepository questionRepo;
    private final GroqService groqService;

    @Transactional
    public SessionResponse startInterview(User user, StartRequest req) {
        InterviewSession session = InterviewSession.builder()
                .user(user)
                .domain(req.getDomain())
                .techStack(req.getTechStack())
                .difficulty(req.getDifficulty())
                .completed(false)
                .build();
        sessionRepo.save(session);

        List<String> questions = groqService.generateQuestions(req.getDomain(), req.getTechStack(), req.getDifficulty());
        for (int i = 0; i < questions.size(); i++) {
            InterviewQuestion q = InterviewQuestion.builder()
                    .session(session)
                    .questionOrder(i + 1)
                    .question(questions.get(i))
                    .build();
            session.getQuestions().add(q);
        }
        sessionRepo.save(session);
        return toSessionResponse(session);
    }

    @Transactional
    public QuestionResponse submitAnswer(User user, Long questionId, String answer) {
        InterviewQuestion q = questionRepo.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        if (!q.getSession().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        Map<String, Object> evaluation = groqService.evaluateAnswer(q.getQuestion(), answer);
        q.setUserAnswer(answer);
        q.setAiFeedback((String) evaluation.get("feedback"));
        q.setScore(((Number) evaluation.get("score")).intValue());
        questionRepo.save(q);

        // Check if all questions answered, then compute session score
        InterviewSession session = q.getSession();
        boolean allAnswered = session.getQuestions().stream().allMatch(qq -> qq.getUserAnswer() != null);
        if (allAnswered) {
            double avg = session.getQuestions().stream().mapToInt(InterviewQuestion::getScore).average().orElse(0);
            session.setScore(Math.round(avg * 10.0) / 10.0);
            session.setCompleted(true);
            sessionRepo.save(session);
        }

        return toQuestionResponse(q);
    }

    public SessionResponse getSession(User user, Long sessionId) {
        InterviewSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        if (!session.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        return toSessionResponse(session);
    }

    public List<SessionResponse> getHistory(User user) {
        return sessionRepo.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toSessionResponse).toList();
    }

    private SessionResponse toSessionResponse(InterviewSession s) {
        return SessionResponse.builder()
                .id(s.getId())
                .domain(s.getDomain())
                .techStack(s.getTechStack())
                .difficulty(s.getDifficulty())
                .score(s.getScore())
                .completed(s.isCompleted())
                .createdAt(s.getCreatedAt())
                .questions(s.getQuestions().stream().map(this::toQuestionResponse).toList())
                .build();
    }

    private QuestionResponse toQuestionResponse(InterviewQuestion q) {
        return QuestionResponse.builder()
                .id(q.getId())
                .questionOrder(q.getQuestionOrder())
                .question(q.getQuestion())
                .userAnswer(q.getUserAnswer())
                .aiFeedback(q.getAiFeedback())
                .score(q.getScore())
                .build();
    }
}

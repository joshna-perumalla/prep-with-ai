package com.prepwithai.controller;

import com.prepwithai.dto.InterviewDto.*;
import com.prepwithai.model.User;
import com.prepwithai.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/start")
    public ResponseEntity<SessionResponse> start(@AuthenticationPrincipal User user,
                                                  @Valid @RequestBody StartRequest req) {
        return ResponseEntity.ok(interviewService.startInterview(user, req));
    }

    @PostMapping("/questions/{questionId}/answer")
    public ResponseEntity<QuestionResponse> answer(@AuthenticationPrincipal User user,
                                                    @PathVariable Long questionId,
                                                    @Valid @RequestBody AnswerRequest req) {
        return ResponseEntity.ok(interviewService.submitAnswer(user, questionId, req.getAnswer()));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<SessionResponse> getSession(@AuthenticationPrincipal User user,
                                                       @PathVariable Long sessionId) {
        return ResponseEntity.ok(interviewService.getSession(user, sessionId));
    }

    @GetMapping("/history")
    public ResponseEntity<List<SessionResponse>> history(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(interviewService.getHistory(user));
    }
}

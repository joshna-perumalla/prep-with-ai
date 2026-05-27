package com.prepwithai.controller;

import com.prepwithai.dto.CodingDto.*;
import com.prepwithai.model.User;
import com.prepwithai.service.CodingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coding")
@RequiredArgsConstructor
public class CodingController {

    private final CodingService codingService;

    @PostMapping("/generate")
    public ResponseEntity<ProblemResponse> generate(@AuthenticationPrincipal User user,
                                                     @RequestBody GenerateRequest req) {
        return ResponseEntity.ok(codingService.generateProblem(user, req));
    }

    @PostMapping("/problems/{problemId}/submit")
    public ResponseEntity<SubmitResponse> submit(@AuthenticationPrincipal User user,
                                                  @PathVariable Long problemId,
                                                  @RequestBody SubmitRequest req) {
        return ResponseEntity.ok(codingService.submitCode(user, problemId, req));
    }

    @GetMapping("/problems/{problemId}")
    public ResponseEntity<ProblemResponse> getProblem(@AuthenticationPrincipal User user,
                                                       @PathVariable Long problemId) {
        return ResponseEntity.ok(codingService.getProblem(user, problemId));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ProblemResponse>> history(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(codingService.getHistory(user));
    }
}

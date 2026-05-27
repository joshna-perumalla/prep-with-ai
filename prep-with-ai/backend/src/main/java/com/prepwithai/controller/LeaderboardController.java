package com.prepwithai.controller;

import com.prepwithai.dto.LeaderboardDto.Response;
import com.prepwithai.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<Response> getLeaderboard(
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String college) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard(domain, difficulty, college));
    }

    @GetMapping("/filters")
    public ResponseEntity<Map<String, List<String>>> getFilters() {
        return ResponseEntity.ok(leaderboardService.getFilterOptions());
    }
}

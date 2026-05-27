package com.prepwithai.service;

import com.prepwithai.dto.LeaderboardDto.*;
import com.prepwithai.model.InterviewSession;
import com.prepwithai.repository.InterviewSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final InterviewSessionRepository sessionRepo;

    @Transactional(readOnly = true)
    public Response getLeaderboard(String domain, String difficulty, String college) {
        List<InterviewSession> all = sessionRepo.findByCompletedTrue();

        // Apply filters
        if (domain != null && !domain.isBlank()) {
            all = all.stream().filter(s -> s.getDomain().equalsIgnoreCase(domain)).collect(Collectors.toList());
        }
        if (difficulty != null && !difficulty.isBlank()) {
            all = all.stream().filter(s -> s.getDifficulty().equalsIgnoreCase(difficulty)).collect(Collectors.toList());
        }
        if (college != null && !college.isBlank()) {
            all = all.stream().filter(s -> college.equalsIgnoreCase(s.getUser().getCollege())).collect(Collectors.toList());
        }

        // Group by user
        Map<Long, List<InterviewSession>> byUser = all.stream()
                .collect(Collectors.groupingBy(s -> s.getUser().getId()));

        List<Entry> entries = byUser.entrySet().stream().map(e -> {
            List<InterviewSession> sessions = e.getValue();
            InterviewSession first = sessions.get(0);
            double avg = sessions.stream().mapToDouble(s -> s.getScore() != null ? s.getScore() : 0).average().orElse(0);
            return Entry.builder()
                    .name(first.getUser().getName())
                    .college(first.getUser().getCollege() != null ? first.getUser().getCollege() : "")
                    .branch(first.getUser().getBranch() != null ? first.getUser().getBranch() : "")
                    .avgScore(Math.round(avg * 10.0) / 10.0)
                    .totalInterviews(sessions.size())
                    .totalCompleted(sessions.size())
                    .build();
        }).sorted(Comparator.comparingDouble(Entry::getAvgScore).reversed())
          .collect(Collectors.toList());

        // Assign ranks
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
        }

        return Response.builder()
                .entries(entries)
                .totalParticipants(entries.size())
                .filterDomain(domain)
                .filterDifficulty(difficulty)
                .filterCollege(college)
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> opts = new LinkedHashMap<>();
        opts.put("domains", sessionRepo.findDistinctDomains());
        opts.put("difficulties", sessionRepo.findDistinctDifficulties());
        opts.put("colleges", sessionRepo.findDistinctColleges());
        return opts;
    }
}

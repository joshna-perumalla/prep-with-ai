package com.prepwithai.dto;

import lombok.*;
import java.util.List;

public class LeaderboardDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Entry {
        private int rank;
        private String name;
        private String college;
        private String branch;
        private double avgScore;
        private int totalInterviews;
        private int totalCompleted;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private List<Entry> entries;
        private int totalParticipants;
        private String filterDomain;
        private String filterDifficulty;
        private String filterCollege;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class Filters {
        private String domain;
        private String difficulty;
        private String college;
    }
}
